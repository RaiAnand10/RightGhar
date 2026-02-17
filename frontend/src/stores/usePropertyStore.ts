import { create } from 'zustand'
import { Property, FilterState, SortOption, BHKFilter, PriceRange, ViewMode } from '../types'
import { fetchAllProjects, fetchProjectDetail } from '../api'
import { apiListItemToProperty, apiDetailToProperty } from '../apiAdapter'
import { filterProperties, sortProperties } from '../utils/propertyHelpers'

interface PropertyStore {
  // All properties (from API)
  allProperties: Property[]
  loading: boolean
  error: string | null

  // Fetch
  fetchProperties: () => Promise<void>

  // Filters
  filters: FilterState
  sortBy: SortOption
  setFilters: (filters: FilterState) => void
  setSortBy: (sort: SortOption) => void
  clearFilters: () => void
  toggleFilter: <K extends keyof FilterState>(
    filterType: K,
    value: FilterState[K] extends Set<infer T> ? T : never
  ) => void

  // Compare
  compareList: Property[]
  isCompareOpen: boolean
  addToCompare: (property: Property) => void
  removeFromCompare: (id: string) => void
  toggleCompare: (property: Property) => void
  setCompareOpen: (open: boolean) => void
  isInCompare: (id: string) => boolean

  // Modal
  selectedProperty: Property | null
  isModalOpen: boolean
  openModal: (property: Property) => Promise<void>
  closeModal: () => void

  // View
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void

  // Computed - derived from filters
  getFilteredProperties: () => Property[]
}

const initialFilters: FilterState = {
  city: new Set<string>(),
  locality: new Set<string>(),
  builder: new Set<string>(),
  bhk: new Set<BHKFilter>(),
  possessionYear: new Set<string>(),
  priceRange: new Set<PriceRange>(),
}

export const usePropertyStore = create<PropertyStore>((set, get) => ({
  // All properties — starts empty, fetched from API
  allProperties: [],
  loading: true,
  error: null,

  fetchProperties: async () => {
    try {
      set({ loading: true, error: null })
      const items = await fetchAllProjects()
      const properties = items.map(apiListItemToProperty)
      set({ allProperties: properties, loading: false })
    } catch (err) {
      console.error('Failed to fetch properties:', err)
      set({ error: (err as Error).message, loading: false })
    }
  },

  // Filters
  filters: initialFilters,
  sortBy: 'default',

  setFilters: (filters) => set({ filters }),

  setSortBy: (sortBy) => set({ sortBy }),

  clearFilters: () =>
    set({
      filters: {
        city: new Set(),
        locality: new Set(),
        builder: new Set(),
        bhk: new Set(),
        possessionYear: new Set(),
        priceRange: new Set(),
      },
      sortBy: 'default',
    }),

  toggleFilter: (filterType, value) => {
    const { filters } = get()
    const currentSet = new Set(filters[filterType])

    if (currentSet.has(value as never)) {
      currentSet.delete(value as never)
    } else {
      currentSet.add(value as never)
    }

    // Special case: clear locality when city changes
    if (filterType === 'city') {
      set({
        filters: {
          ...filters,
          [filterType]: currentSet,
          locality: new Set(),
        },
      })
    } else {
      set({
        filters: {
          ...filters,
          [filterType]: currentSet,
        },
      })
    }
  },

  // Compare
  compareList: [],
  isCompareOpen: false,

  addToCompare: (property) => {
    const { compareList } = get()
    if (compareList.length < 4 && !compareList.some((p) => p.metadata.id === property.metadata.id)) {
      set({ compareList: [...compareList, property] })
    }
  },

  removeFromCompare: (id) => {
    const { compareList } = get()
    set({ compareList: compareList.filter((p) => p.metadata.id !== id) })
  },

  toggleCompare: (property) => {
    const { compareList, addToCompare, removeFromCompare } = get()
    const isInList = compareList.some((p) => p.metadata.id === property.metadata.id)
    if (isInList) {
      removeFromCompare(property.metadata.id)
    } else {
      addToCompare(property)
    }
  },

  setCompareOpen: (open) => set({ isCompareOpen: open }),

  isInCompare: (id) => {
    const { compareList } = get()
    return compareList.some((p) => p.metadata.id === id)
  },

  // Modal
  selectedProperty: null,
  isModalOpen: false,

  openModal: async (property) => {
    // Show modal immediately with listing data
    set({ selectedProperty: property, isModalOpen: true })
    // Fetch full detail in background and update
    try {
      const detail = await fetchProjectDetail(property.metadata.id)
      const fullProperty = apiDetailToProperty(detail)
      set({ selectedProperty: fullProperty })
    } catch (err) {
      console.error('Failed to fetch project detail:', err)
      // Keep showing listing data — modal still works with partial data
    }
  },

  closeModal: () => {
    set({ isModalOpen: false })
    // Clear selected property after animation
    setTimeout(() => set({ selectedProperty: null }), 300)
  },

  // View
  viewMode: 'grid',
  setViewMode: (viewMode) => set({ viewMode }),

  // Computed
  getFilteredProperties: () => {
    const { allProperties, filters, sortBy } = get()
    const filtered = filterProperties(allProperties, filters)
    return sortProperties(filtered, sortBy)
  },
}))
