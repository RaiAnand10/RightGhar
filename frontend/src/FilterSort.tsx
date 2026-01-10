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

// Re-export types for backward compatibility
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

  // Close dropdown when clicking outside
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

  const toggleBHK = (bhk: BHKFilter) => {
    const newBHK = new Set(filters.bhk)
    if (newBHK.has(bhk)) {
      newBHK.delete(bhk)
    } else {
      newBHK.add(bhk)
    }
    setFilters({ ...filters, bhk: newBHK })
  }

  const toggleCity = (city: string) => {
    const newCities = new Set(filters.city)
    if (newCities.has(city)) {
      newCities.delete(city)
    } else {
      newCities.add(city)
    }
    // Clear locality when city changes
    setFilters({ ...filters, city: newCities, locality: new Set() })
  }

  const toggleLocality = (locality: string) => {
    const newLocalities = new Set(filters.locality)
    if (newLocalities.has(locality)) {
      newLocalities.delete(locality)
    } else {
      newLocalities.add(locality)
    }
    setFilters({ ...filters, locality: newLocalities })
  }

  const toggleBuilder = (builder: string) => {
    const newBuilders = new Set(filters.builder)
    if (newBuilders.has(builder)) {
      newBuilders.delete(builder)
    } else {
      newBuilders.add(builder)
    }
    setFilters({ ...filters, builder: newBuilders })
  }

  const togglePossessionYear = (year: string) => {
    const newYears = new Set(filters.possessionYear)
    if (newYears.has(year)) {
      newYears.delete(year)
    } else {
      newYears.add(year)
    }
    setFilters({ ...filters, possessionYear: newYears })
  }

  const togglePriceRange = (range: PriceRange) => {
    const newRanges = new Set(filters.priceRange)
    if (newRanges.has(range)) {
      newRanges.delete(range)
    } else {
      newRanges.add(range)
    }
    setFilters({ ...filters, priceRange: newRanges })
  }

  const activeFiltersCount = filters.city.size + filters.locality.size + filters.builder.size + filters.bhk.size + filters.possessionYear.size + filters.priceRange.size

  // Get available localities based on selected cities, filtered by search
  const availableLocalities = filters.city.size > 0
    ? Array.from(filters.city).flatMap(city => localityOptions[city] || [])
    : []

  const filteredLocalities = availableLocalities.filter(locality =>
    locality.toLowerCase().includes(localitySearch.toLowerCase())
  )

  // Filter builders by search
  const filteredBuilders = builderOptions.filter(builder =>
    builder.toLowerCase().includes(builderSearch.toLowerCase())
  )

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown)
    // Clear search when closing dropdown
    if (openDropdown === 'locality') {
      setLocalitySearch('')
    }
    if (openDropdown === 'builder') {
      setBuilderSearch('')
    }
  }

  // Base button styles
  const filterButtonBase = "px-5 py-2.5 bg-white border-2 border-slate-200 rounded-lg text-sm font-medium text-slate-600 cursor-pointer transition-all flex items-center gap-2 whitespace-nowrap hover:border-primary hover:text-primary hover:bg-primary/5 md:w-auto w-full md:justify-start justify-between"
  const filterButtonActive = "bg-gradient-to-r from-primary to-secondary text-white border-transparent hover:from-primary-dark hover:to-secondary-dark hover:border-transparent hover:text-white hover:bg-none"

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center gap-6 p-6 bg-white rounded-xl shadow-card flex-wrap lg:flex-row flex-col lg:items-center items-stretch">
        <div className="flex gap-4 flex-wrap flex-1 md:flex-row flex-col">
          {/* City Filter */}
          <div className="relative" ref={el => dropdownRefs.current['city'] = el}>
            <button
              className={`${filterButtonBase} ${filters.city.size > 0 ? filterButtonActive : ''}`}
              onClick={() => toggleDropdown('city')}
            >
              City
              {filters.city.size > 0 && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 bg-white/30 rounded-full text-xs font-semibold">
                  {filters.city.size}
                </span>
              )}
              <span className="text-[0.625rem] opacity-70">{openDropdown === 'city' ? '▲' : '▼'}</span>
            </button>
            {openDropdown === 'city' && (
              <div className="absolute top-[calc(100%+0.5rem)] left-0 bg-white border border-slate-200 rounded-lg shadow-dropdown z-[1000] min-w-[180px] max-h-[300px] overflow-y-auto py-2 md:w-auto w-full">
                {cityOptions.map(city => (
                  <label key={city} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors text-sm text-slate-600 hover:bg-primary/5">
                    <input
                      type="checkbox"
                      checked={filters.city.has(city)}
                      onChange={() => toggleCity(city)}
                      className="w-4 h-4 cursor-pointer accent-primary"
                    />
                    <span className="flex-1 select-none">{city}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Locality Filter - Only show if at least one city is selected */}
          {filters.city.size > 0 && (
            <div className="relative" ref={el => dropdownRefs.current['locality'] = el}>
              <button
                className={`${filterButtonBase} ${filters.locality.size > 0 ? filterButtonActive : ''}`}
                onClick={() => toggleDropdown('locality')}
              >
                Locality
                {filters.locality.size > 0 && (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 bg-white/30 rounded-full text-xs font-semibold">
                    {filters.locality.size}
                  </span>
                )}
                <span className="text-[0.625rem] opacity-70">{openDropdown === 'locality' ? '▲' : '▼'}</span>
              </button>
              {openDropdown === 'locality' && (
                <div className="absolute top-[calc(100%+0.5rem)] left-0 bg-white border border-slate-200 rounded-lg shadow-dropdown z-[1000] min-w-[220px] p-0 md:w-auto w-full">
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-none border-b border-slate-200 text-sm outline-none bg-primary/5 text-slate-800 focus:bg-white"
                    placeholder="Type to search..."
                    value={localitySearch}
                    onChange={(e) => setLocalitySearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                  <div className="max-h-[250px] overflow-y-auto py-2">
                    {filteredLocalities.length > 0 ? (
                      filteredLocalities.map(locality => (
                        <label key={locality} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors text-sm text-slate-600 hover:bg-primary/5">
                          <input
                            type="checkbox"
                            checked={filters.locality.has(locality)}
                            onChange={() => toggleLocality(locality)}
                            className="w-4 h-4 cursor-pointer accent-primary"
                          />
                          <span className="flex-1 select-none">{locality}</span>
                        </label>
                      ))
                    ) : (
                      <div className="p-4 text-center text-slate-400 text-sm">No localities found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Builder Filter */}
          <div className="relative" ref={el => dropdownRefs.current['builder'] = el}>
            <button
              className={`${filterButtonBase} ${filters.builder.size > 0 ? filterButtonActive : ''}`}
              onClick={() => toggleDropdown('builder')}
            >
              Builder
              {filters.builder.size > 0 && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 bg-white/30 rounded-full text-xs font-semibold">
                  {filters.builder.size}
                </span>
              )}
              <span className="text-[0.625rem] opacity-70">{openDropdown === 'builder' ? '▲' : '▼'}</span>
            </button>
            {openDropdown === 'builder' && (
              <div className="absolute top-[calc(100%+0.5rem)] left-0 bg-white border border-slate-200 rounded-lg shadow-dropdown z-[1000] min-w-[220px] p-0 md:w-auto w-full">
                <input
                  type="text"
                  className="w-full px-4 py-3 border-none border-b border-slate-200 text-sm outline-none bg-primary/5 text-slate-800 focus:bg-white"
                  placeholder="Type to search..."
                  value={builderSearch}
                  onChange={(e) => setBuilderSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
                <div className="max-h-[250px] overflow-y-auto py-2">
                  {filteredBuilders.length > 0 ? (
                    filteredBuilders.map(builder => (
                      <label key={builder} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors text-sm text-slate-600 hover:bg-primary/5">
                        <input
                          type="checkbox"
                          checked={filters.builder.has(builder)}
                          onChange={() => toggleBuilder(builder)}
                          className="w-4 h-4 cursor-pointer accent-primary"
                        />
                        <span className="flex-1 select-none">{builder}</span>
                      </label>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-400 text-sm">No builders found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Configuration Filter */}
          <div className="relative" ref={el => dropdownRefs.current['config'] = el}>
            <button
              className={`${filterButtonBase} ${filters.bhk.size > 0 ? filterButtonActive : ''}`}
              onClick={() => toggleDropdown('config')}
            >
              Configuration
              {filters.bhk.size > 0 && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 bg-white/30 rounded-full text-xs font-semibold">
                  {filters.bhk.size}
                </span>
              )}
              <span className="text-[0.625rem] opacity-70">{openDropdown === 'config' ? '▲' : '▼'}</span>
            </button>
            {openDropdown === 'config' && (
              <div className="absolute top-[calc(100%+0.5rem)] left-0 bg-white border border-slate-200 rounded-lg shadow-dropdown z-[1000] min-w-[180px] max-h-[300px] overflow-y-auto py-2 md:w-auto w-full">
                {bhkOptions.map(bhk => (
                  <label key={bhk} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors text-sm text-slate-600 hover:bg-primary/5">
                    <input
                      type="checkbox"
                      checked={filters.bhk.has(bhk)}
                      onChange={() => toggleBHK(bhk)}
                      className="w-4 h-4 cursor-pointer accent-primary"
                    />
                    <span className="flex-1 select-none">{bhk} BHK</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Possession Year Filter */}
          <div className="relative" ref={el => dropdownRefs.current['possession'] = el}>
            <button
              className={`${filterButtonBase} ${filters.possessionYear.size > 0 ? filterButtonActive : ''}`}
              onClick={() => toggleDropdown('possession')}
            >
              Possession Year
              {filters.possessionYear.size > 0 && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 bg-white/30 rounded-full text-xs font-semibold">
                  {filters.possessionYear.size}
                </span>
              )}
              <span className="text-[0.625rem] opacity-70">{openDropdown === 'possession' ? '▲' : '▼'}</span>
            </button>
            {openDropdown === 'possession' && (
              <div className="absolute top-[calc(100%+0.5rem)] left-0 bg-white border border-slate-200 rounded-lg shadow-dropdown z-[1000] min-w-[180px] max-h-[300px] overflow-y-auto py-2 md:w-auto w-full">
                {possessionYears.map(year => (
                  <label key={year} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors text-sm text-slate-600 hover:bg-primary/5">
                    <input
                      type="checkbox"
                      checked={filters.possessionYear.has(year)}
                      onChange={() => togglePossessionYear(year)}
                      className="w-4 h-4 cursor-pointer accent-primary"
                    />
                    <span className="flex-1 select-none">{year}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Price Range Filter */}
          <div className="relative" ref={el => dropdownRefs.current['price'] = el}>
            <button
              className={`${filterButtonBase} ${filters.priceRange.size > 0 ? filterButtonActive : ''}`}
              onClick={() => toggleDropdown('price')}
            >
              Price Range
              {filters.priceRange.size > 0 && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 bg-white/30 rounded-full text-xs font-semibold">
                  {filters.priceRange.size}
                </span>
              )}
              <span className="text-[0.625rem] opacity-70">{openDropdown === 'price' ? '▲' : '▼'}</span>
            </button>
            {openDropdown === 'price' && (
              <div className="absolute top-[calc(100%+0.5rem)] left-0 bg-white border border-slate-200 rounded-lg shadow-dropdown z-[1000] min-w-[180px] max-h-[300px] overflow-y-auto py-2 md:w-auto w-full">
                {priceRanges.map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors text-sm text-slate-600 hover:bg-primary/5">
                    <input
                      type="checkbox"
                      checked={filters.priceRange.has(value)}
                      onChange={() => togglePriceRange(value)}
                      className="w-4 h-4 cursor-pointer accent-primary"
                    />
                    <span className="flex-1 select-none">{label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 lg:flex-row flex-col lg:w-auto w-full">
          <button
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-all whitespace-nowrap relative hover:from-primary-dark hover:to-secondary-dark hover:-translate-y-0.5 hover:shadow-lg lg:w-auto w-full justify-center"
            onClick={onCompareClick}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 12h6m-6 4h6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Compare Projects
            {compareCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 bg-white/30 rounded-full text-xs font-bold ml-1">
                {compareCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2 lg:w-auto w-full">
            <label htmlFor="sort-select" className="text-sm font-medium text-slate-500 whitespace-nowrap">
              Sort:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2.5 pr-10 border-2 border-slate-200 rounded-lg text-sm text-slate-600 bg-white cursor-pointer transition-all appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23475569%22%20d%3D%22M6%209L1%204h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.75rem_center] min-w-[180px] hover:border-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 lg:min-w-[180px] lg:flex-none flex-1"
            >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="possession-asc">Possession: Earliest</option>
              <option value="possession-desc">Possession: Latest</option>
            </select>
          </div>

          {activeFiltersCount > 0 && (
            <button
              className="px-5 py-2.5 bg-red-50 border-2 border-red-200 rounded-lg text-sm font-medium text-red-600 cursor-pointer transition-all whitespace-nowrap hover:bg-red-200 hover:border-red-300 lg:w-auto w-full"
              onClick={clearFilters}
            >
              Clear All ({activeFiltersCount})
            </button>
          )}
        </div>
      </div>

      {propertyCount > 0 && (
        <div className="mt-4 text-center text-sm text-slate-500 font-medium">
          Showing {propertyCount} {propertyCount === 1 ? 'property' : 'properties'}
        </div>
      )}
    </div>
  )
}

export default FilterSort
