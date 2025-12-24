import { useState, useRef, useEffect } from 'react'
import './FilterSort.css'

export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'possession-asc' | 'possession-desc'
export type BHKFilter = '2' | '3' | '4'
export type PriceRange = '0.5-1' | '1-1.5' | '1.5-2' | '2-2.5' | '2.5-4' | '4-6' | '6-10' | '10+'

export interface FilterState {
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

function FilterSort({ sortBy, filters, onSortChange, onFilterChange, propertyCount }: FilterSortProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
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
      bhk: new Set(),
      possessionYear: new Set(),
      priceRange: new Set(),
    })
    onSortChange('default')
  }

  const activeFiltersCount = filters.bhk.size + filters.possessionYear.size + filters.priceRange.size

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown)
  }

  return (
    <div className="filter-sort-container">
      <div className="filter-sort-controls">
        <div className="filter-buttons-group">
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
