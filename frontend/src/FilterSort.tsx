import { useState, useRef, useEffect } from 'react'
import { SortOption, BHKFilter, PriceRange, FilterState } from './types'
import {
  priceRanges,
  possessionYears,
  bhkOptions,
  cityOptions,
  localityOptions,
  builderOptions
} from './constants/filterOptions'
import { usePropertyStore } from './stores/usePropertyStore'

export type { SortOption, BHKFilter, PriceRange, FilterState }

interface FilterSortProps {
  propertyCount: number
  compareCount: number
  onCompareClick: () => void
}

function FilterSort({ propertyCount, compareCount, onCompareClick }: FilterSortProps) {
  const { filters, sortBy, setFilters, setSortBy, clearFilters } = usePropertyStore()

  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [localitySearch, setLocalitySearch] = useState('')
  const [builderSearch, setBuilderSearch] = useState('')
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && dropdownRefs.current[openDropdown]) {
        const dropdown = dropdownRefs.current[openDropdown]
        if (dropdown && !dropdown.contains(event.target as Node)) {
          setOpenDropdown(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdown])

  const toggleFilter = <T,>(currentSet: Set<T>, value: T): Set<T> => {
    const newSet = new Set(currentSet)
    if (newSet.has(value)) {
      newSet.delete(value)
    } else {
      newSet.add(value)
    }
    return newSet
  }

  const toggleCity = (city: string) => {
    setFilters({ ...filters, city: toggleFilter(filters.city, city), locality: new Set() })
  }

  const toggleLocality = (locality: string) => {
    setFilters({ ...filters, locality: toggleFilter(filters.locality, locality) })
  }

  const toggleBuilder = (builder: string) => {
    setFilters({ ...filters, builder: toggleFilter(filters.builder, builder) })
  }

  const toggleBHK = (bhk: BHKFilter) => {
    setFilters({ ...filters, bhk: toggleFilter(filters.bhk, bhk) })
  }

  const togglePossessionYear = (year: string) => {
    setFilters({ ...filters, possessionYear: toggleFilter(filters.possessionYear, year) })
  }

  const togglePriceRange = (range: PriceRange) => {
    setFilters({ ...filters, priceRange: toggleFilter(filters.priceRange, range) })
  }

  const activeFiltersCount =
    filters.city.size +
    filters.locality.size +
    filters.builder.size +
    filters.bhk.size +
    filters.possessionYear.size +
    filters.priceRange.size

  const availableLocalities = filters.city.size > 0
    ? Array.from(filters.city).flatMap(city => localityOptions[city] || [])
    : []

  const filteredLocalities = availableLocalities.filter(locality =>
    locality.toLowerCase().includes(localitySearch.toLowerCase())
  )

  const filteredBuilders = builderOptions.filter(builder =>
    builder.toLowerCase().includes(builderSearch.toLowerCase())
  )

  const toggleDropdown = (dropdown: string) => {
    if (openDropdown === dropdown) {
      setOpenDropdown(null)
    } else {
      setOpenDropdown(dropdown)
      setLocalitySearch('')
      setBuilderSearch('')
    }
  }

  // Dropdown component for reuse
  const FilterDropdown = ({
    id,
    label,
    count,
    children
  }: {
    id: string
    label: string
    count: number
    children: React.ReactNode
  }) => (
    <div className="relative" ref={el => dropdownRefs.current[id] = el}>
      <button
        onClick={() => toggleDropdown(id)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          count > 0
            ? 'bg-teal-50 text-teal-600 border border-teal-200'
            : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
        }`}
      >
        {label}
        {count > 0 && (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-600 text-white text-xs">
            {count}
          </span>
        )}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${openDropdown === id ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {openDropdown === id && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-stone-200 rounded-xl shadow-dropdown z-50 min-w-[200px] max-h-[300px] overflow-hidden">
          {children}
        </div>
      )}
    </div>
  )

  const CheckboxOption = ({
    checked,
    onToggle,
    label
  }: {
    checked: boolean
    onToggle: () => void
    label: string
  }) => (
    <label className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-stone-50 transition-colors" onClick={onToggle}>
      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
        checked
          ? 'bg-teal-600 border-teal-600'
          : 'border-stone-200 hover:border-stone-300'
      }`}>
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-sm text-stone-900">{label}</span>
    </label>
  )

  return (
    <div className="mb-8">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* City */}
        <FilterDropdown id="city" label="City" count={filters.city.size}>
          <div className="py-2">
            {cityOptions.map(city => (
              <CheckboxOption
                key={city}
                checked={filters.city.has(city)}
                onToggle={() => toggleCity(city)}
                label={city}
              />
            ))}
          </div>
        </FilterDropdown>

        {/* Locality - only show if city selected */}
        {filters.city.size > 0 && (
          <FilterDropdown id="locality" label="Locality" count={filters.locality.size}>
            <div>
              <input
                type="text"
                placeholder="Search locality..."
                value={localitySearch}
                onChange={(e) => setLocalitySearch(e.target.value)}
                className="w-full px-4 py-3 border-b border-stone-200 text-sm bg-transparent outline-none placeholder:text-stone-400"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="py-2 max-h-[200px] overflow-y-auto">
                {filteredLocalities.length > 0 ? (
                  filteredLocalities.map(locality => (
                    <CheckboxOption
                      key={locality}
                      checked={filters.locality.has(locality)}
                      onToggle={() => toggleLocality(locality)}
                      label={locality}
                    />
                  ))
                ) : (
                  <p className="px-4 py-3 text-sm text-stone-400">No localities found</p>
                )}
              </div>
            </div>
          </FilterDropdown>
        )}

        {/* Builder */}
        <FilterDropdown id="builder" label="Builder" count={filters.builder.size}>
          <div>
            <input
              type="text"
              placeholder="Search builder..."
              value={builderSearch}
              onChange={(e) => setBuilderSearch(e.target.value)}
              className="w-full px-4 py-3 border-b border-stone-200 text-sm bg-transparent outline-none placeholder:text-stone-400"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="py-2 max-h-[200px] overflow-y-auto">
              {filteredBuilders.length > 0 ? (
                filteredBuilders.map(builder => (
                  <CheckboxOption
                    key={builder}
                    checked={filters.builder.has(builder)}
                    onToggle={() => toggleBuilder(builder)}
                    label={builder}
                  />
                ))
              ) : (
                <p className="px-4 py-3 text-sm text-stone-400">No builders found</p>
              )}
            </div>
          </div>
        </FilterDropdown>

        {/* Configuration */}
        <FilterDropdown id="config" label="Config" count={filters.bhk.size}>
          <div className="py-2">
            {bhkOptions.map(bhk => (
              <CheckboxOption
                key={bhk}
                checked={filters.bhk.has(bhk)}
                onToggle={() => toggleBHK(bhk)}
                label={`${bhk} BHK`}
              />
            ))}
          </div>
        </FilterDropdown>

        {/* Possession */}
        <FilterDropdown id="possession" label="Possession" count={filters.possessionYear.size}>
          <div className="py-2">
            {possessionYears.map(year => (
              <CheckboxOption
                key={year}
                checked={filters.possessionYear.has(year)}
                onToggle={() => togglePossessionYear(year)}
                label={year}
              />
            ))}
          </div>
        </FilterDropdown>

        {/* Price Range */}
        <FilterDropdown id="price" label="Price" count={filters.priceRange.size}>
          <div className="py-2">
            {priceRanges.map(({ value, label }) => (
              <CheckboxOption
                key={value}
                checked={filters.priceRange.has(value)}
                onToggle={() => togglePriceRange(value)}
                label={label}
              />
            ))}
          </div>
        </FilterDropdown>

        {/* Divider */}
        <div className="w-px h-8 bg-stone-200 mx-1 hidden sm:block" />

        {/* Sort */}
        <div className="relative" ref={el => dropdownRefs.current['sort'] = el}>
          <button
            onClick={() => toggleDropdown('sort')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white text-stone-600 border border-stone-200 hover:border-stone-300 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
            </svg>
            Sort
          </button>
          {openDropdown === 'sort' && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-stone-200 rounded-xl shadow-dropdown z-50 min-w-[180px] py-2">
              {[
                { value: 'default', label: 'Default' },
                { value: 'price-asc', label: 'Price: Low to High' },
                { value: 'price-desc', label: 'Price: High to Low' },
                { value: 'possession-asc', label: 'Possession: Earliest' },
                { value: 'possession-desc', label: 'Possession: Latest' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortBy(option.value as SortOption)
                    setOpenDropdown(null)
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                    sortBy === option.value
                      ? 'text-teal-600 bg-teal-50'
                      : 'text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-stone-400 hover:text-stone-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Compare Button */}
        <button
          onClick={onCompareClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            compareCount > 0
              ? 'bg-teal-600 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          Compare
          {compareCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs">
              {compareCount}
            </span>
          )}
        </button>
      </div>

      {/* Results Count */}
      <p className="text-sm text-stone-400">
        {propertyCount} {propertyCount === 1 ? 'property' : 'properties'} found
      </p>
    </div>
  )
}

export default FilterSort
