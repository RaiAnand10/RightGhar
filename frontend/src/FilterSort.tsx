import { useState, useRef, useEffect } from 'react'
import './FilterSort.css'

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'possession-asc' | 'possession-desc'
export type BHKFilter = '2' | '3' | '4'
export type PriceRange = '0.5-1' | '1-1.5' | '1.5-2' | '2-2.5' | '2.5-4' | '4-6' | '6-10' | '10+'

export interface FilterState {
  city: Set<string>
  locality: Set<string>
  builder: Set<string>
  bhk: Set<BHKFilter>
  possessionYear: Set<string>
  priceRange: Set<PriceRange>
}

interface FilterSortProps {
  sortBy: SortOption
  filters: FilterState
  onSortChange: (sort: SortOption) => void
  onFilterChange: (filters: FilterState) => void
  propertyCount: number
  compareCount: number
  onCompareClick: () => void
}

const priceRanges: { value: PriceRange; label: string }[] = [
  { value: '0.5-1', label: '₹50L - ₹1Cr' },
  { value: '1-1.5', label: '₹1Cr - ₹1.5Cr' },
  { value: '1.5-2', label: '₹1.5Cr - ₹2Cr' },
  { value: '2-2.5', label: '₹2Cr - ₹2.5Cr' },
  { value: '2.5-4', label: '₹2.5Cr - ₹4Cr' },
  { value: '4-6', label: '₹4Cr - ₹6Cr' },
  { value: '6-10', label: '₹6Cr - ₹10Cr' },
  { value: '10+', label: '₹10Cr+' },
]

const possessionYears = ['2026', '2027', '2028', '2029']
const bhkOptions: BHKFilter[] = ['2', '3', '4']
const cityOptions = ['Hyderabad', 'Bangalore']
const localityOptions: { [key: string]: string[] } = {
  'Hyderabad': [
    'Kokapet',
    'Tellapur', 
    'Kondapur',
    'Financial District',
    'Osman Nagar',
    'Neopolis',
    'Narsingi',
    'Nallagandla',
    'Gopanpally',
    'Rajendra Nagar',
    'Puppalaguda',
    'Kompally',
    'Uppal',
    'Miyapur',
    'Manchirevula',
    'Kukatpally',
    'Kollur',
    'Gachibowli',
    'Bachupally',
    'Shamshabad'
  ],
  'Bangalore': []
}

const builderOptions = [
  'Aparna Constructions',
  'Ramky Estates',
  'Rajapushpa Properties',
  'Vasavi group',
  'Hallmark builders',
  'Myscape',
  'My Home Group',
  'My Home Constructions',
  'DSR builders',
  'Vertex homes',
  'Prestige Constructions',
  'Jayabheri',
  'Candeur',
  'Raghava',
  'Lansum',
  'Honer Homes',
  'Sumadhura',
  'GHR infra',
  'Brigade',
  'ASBL'
]

function FilterSort({ sortBy, filters, onSortChange, onFilterChange, propertyCount, compareCount, onCompareClick }: FilterSortProps) {
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
    onFilterChange({ ...filters, bhk: newBHK })
  }

  const toggleCity = (city: string) => {
    const newCities = new Set(filters.city)
    if (newCities.has(city)) {
      newCities.delete(city)
    } else {
      newCities.add(city)
    }
    // Clear locality when city changes
    onFilterChange({ ...filters, city: newCities, locality: new Set() })
  }

  const toggleLocality = (locality: string) => {
    const newLocalities = new Set(filters.locality)
    if (newLocalities.has(locality)) {
      newLocalities.delete(locality)
    } else {
      newLocalities.add(locality)
    }
    onFilterChange({ ...filters, locality: newLocalities })
  }

  const toggleBuilder = (builder: string) => {
    const newBuilders = new Set(filters.builder)
    if (newBuilders.has(builder)) {
      newBuilders.delete(builder)
    } else {
      newBuilders.add(builder)
    }
    onFilterChange({ ...filters, builder: newBuilders })
  }

  const togglePossessionYear = (year: string) => {
    const newYears = new Set(filters.possessionYear)
    if (newYears.has(year)) {
      newYears.delete(year)
    } else {
      newYears.add(year)
    }
    onFilterChange({ ...filters, possessionYear: newYears })
  }

  const togglePriceRange = (range: PriceRange) => {
    const newRanges = new Set(filters.priceRange)
    if (newRanges.has(range)) {
      newRanges.delete(range)
    } else {
      newRanges.add(range)
    }
    onFilterChange({ ...filters, priceRange: newRanges })
  }

  const clearAllFilters = () => {
    onFilterChange({
      city: new Set(),
      locality: new Set(),
      builder: new Set(),
      bhk: new Set(),
      possessionYear: new Set(),
      priceRange: new Set(),
    })
    onSortChange('default')
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

  return (
    <div className="filter-sort-container">
      <div className="filter-sort-controls">
        <div className="filter-buttons-group">
          {/* City Filter */}
          <div className="filter-dropdown" ref={el => dropdownRefs.current['city'] = el}>
            <button
              className={`filter-button-inline ${filters.city.size > 0 ? 'has-selection' : ''}`}
              onClick={() => toggleDropdown('city')}
            >
              City
              {filters.city.size > 0 && (
                <span className="filter-badge">{filters.city.size}</span>
              )}
              <span className="dropdown-arrow">{openDropdown === 'city' ? '▲' : '▼'}</span>
            </button>
            {openDropdown === 'city' && (
              <div className="dropdown-menu">
                {cityOptions.map(city => (
                  <label key={city} className="dropdown-option">
                    <input
                      type="checkbox"
                      checked={filters.city.has(city)}
                      onChange={() => toggleCity(city)}
                    />
                    <span>{city}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Locality Filter - Only show if at least one city is selected */}
          {filters.city.size > 0 && (
            <div className="filter-dropdown" ref={el => dropdownRefs.current['locality'] = el}>
              <button
                className={`filter-button-inline ${filters.locality.size > 0 ? 'has-selection' : ''}`}
                onClick={() => toggleDropdown('locality')}
              >
                Locality
                {filters.locality.size > 0 && (
                  <span className="filter-badge">{filters.locality.size}</span>
                )}
                <span className="dropdown-arrow">{openDropdown === 'locality' ? '▲' : '▼'}</span>
              </button>
              {openDropdown === 'locality' && (
                <div className="dropdown-menu dropdown-menu-searchable">
                  <input
                    type="text"
                    className="dropdown-search-input"
                    placeholder="Type to search..."
                    value={localitySearch}
                    onChange={(e) => setLocalitySearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                  <div className="dropdown-options-list">
                    {filteredLocalities.length > 0 ? (
                      filteredLocalities.map(locality => (
                        <label key={locality} className="dropdown-option">
                          <input
                            type="checkbox"
                            checked={filters.locality.has(locality)}
                            onChange={() => toggleLocality(locality)}
                          />
                          <span>{locality}</span>
                        </label>
                      ))
                    ) : (
                      <div className="dropdown-no-results">No localities found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Builder Filter */}
          <div className="filter-dropdown" ref={el => dropdownRefs.current['builder'] = el}>
            <button
              className={`filter-button-inline ${filters.builder.size > 0 ? 'has-selection' : ''}`}
              onClick={() => toggleDropdown('builder')}
            >
              Builder
              {filters.builder.size > 0 && (
                <span className="filter-badge">{filters.builder.size}</span>
              )}
              <span className="dropdown-arrow">{openDropdown === 'builder' ? '▲' : '▼'}</span>
            </button>
            {openDropdown === 'builder' && (
              <div className="dropdown-menu dropdown-menu-searchable">
                <input
                  type="text"
                  className="dropdown-search-input"
                  placeholder="Type to search..."
                  value={builderSearch}
                  onChange={(e) => setBuilderSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
                <div className="dropdown-options-list">
                  {filteredBuilders.length > 0 ? (
                    filteredBuilders.map(builder => (
                      <label key={builder} className="dropdown-option">
                        <input
                          type="checkbox"
                          checked={filters.builder.has(builder)}
                          onChange={() => toggleBuilder(builder)}
                        />
                        <span>{builder}</span>
                      </label>
                    ))
                  ) : (
                    <div className="dropdown-no-results">No builders found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Configuration Filter */}
          <div className="filter-dropdown" ref={el => dropdownRefs.current['config'] = el}>
            <button
              className={`filter-button-inline ${filters.bhk.size > 0 ? 'has-selection' : ''}`}
              onClick={() => toggleDropdown('config')}
            >
              Configuration
              {filters.bhk.size > 0 && (
                <span className="filter-badge">{filters.bhk.size}</span>
              )}
              <span className="dropdown-arrow">{openDropdown === 'config' ? '▲' : '▼'}</span>
            </button>
            {openDropdown === 'config' && (
              <div className="dropdown-menu">
                {bhkOptions.map(bhk => (
                  <label key={bhk} className="dropdown-option">
                    <input
                      type="checkbox"
                      checked={filters.bhk.has(bhk)}
                      onChange={() => toggleBHK(bhk)}
                    />
                    <span>{bhk} BHK</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Possession Year Filter */}
          <div className="filter-dropdown" ref={el => dropdownRefs.current['possession'] = el}>
            <button
              className={`filter-button-inline ${filters.possessionYear.size > 0 ? 'has-selection' : ''}`}
              onClick={() => toggleDropdown('possession')}
            >
              Possession Year
              {filters.possessionYear.size > 0 && (
                <span className="filter-badge">{filters.possessionYear.size}</span>
              )}
              <span className="dropdown-arrow">{openDropdown === 'possession' ? '▲' : '▼'}</span>
            </button>
            {openDropdown === 'possession' && (
              <div className="dropdown-menu">
                {possessionYears.map(year => (
                  <label key={year} className="dropdown-option">
                    <input
                      type="checkbox"
                      checked={filters.possessionYear.has(year)}
                      onChange={() => togglePossessionYear(year)}
                    />
                    <span>{year}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Price Range Filter */}
          <div className="filter-dropdown" ref={el => dropdownRefs.current['price'] = el}>
            <button
              className={`filter-button-inline ${filters.priceRange.size > 0 ? 'has-selection' : ''}`}
              onClick={() => toggleDropdown('price')}
            >
              Price Range
              {filters.priceRange.size > 0 && (
                <span className="filter-badge">{filters.priceRange.size}</span>
              )}
              <span className="dropdown-arrow">{openDropdown === 'price' ? '▲' : '▼'}</span>
            </button>
            {openDropdown === 'price' && (
              <div className="dropdown-menu">
                {priceRanges.map(({ value, label }) => (
                  <label key={value} className="dropdown-option">
                    <input
                      type="checkbox"
                      checked={filters.priceRange.has(value)}
                      onChange={() => togglePriceRange(value)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="sort-and-clear">
          <button className="compare-header-button" onClick={onCompareClick}>
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
              <span className="compare-count-badge-header">{compareCount}</span>
            )}
          </button>

          <div className="sort-control">
            <label htmlFor="sort-select">Sort:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="sort-select"
            >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="possession-asc">Possession: Earliest</option>
              <option value="possession-desc">Possession: Latest</option>
            </select>
          </div>

          {activeFiltersCount > 0 && (
            <button className="clear-filters-button" onClick={clearAllFilters}>
              Clear All ({activeFiltersCount})
            </button>
          )}
        </div>
      </div>

      {propertyCount > 0 && (
        <div className="results-count">
          Showing {propertyCount} {propertyCount === 1 ? 'property' : 'properties'}
        </div>
      )}
    </div>
  )
}

export default FilterSort
