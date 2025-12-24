import { useState, useMemo } from 'react'
import './App.css'
import PropertyCard from './PropertyCard'
import PropertyModal from './PropertyModal'
import FilterSort, { SortOption, FilterState, BHKFilter, PriceRange } from './FilterSort'
import { properties, Property } from './data'

function App() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('default')
  const [filters, setFilters] = useState<FilterState>({
    bhk: new Set<BHKFilter>(),
    possessionYear: new Set<string>(),
    priceRange: new Set<PriceRange>(),
  })

  // Extract price from string (e.g., "₹2.25 CR" -> 2.25)
  const extractPrice = (priceStr: string | undefined): number | null => {
    if (!priceStr) return null
    
    const match = priceStr.match(/₹?\s*(\d+\.?\d*)\s*(CR|Cr|cr|L|Lakh|lakh)?/i)
    if (!match) return null
    
    const value = parseFloat(match[1])
    const unit = match[2]?.toLowerCase()
    
    if (unit?.startsWith('cr')) {
      return value // Already in crores
    } else if (unit?.includes('l')) {
      return value / 100 // Convert lakhs to crores
    }
    return value
  }

  // Extract year from possession string
  const extractYear = (possessionStr: string | undefined): number | null => {
    if (!possessionStr) return null
    
    const match = possessionStr.match(/\d{4}/)
    return match ? parseInt(match[0]) : null
  }

  // Check if property matches BHK filter
  const matchesBHK = (property: Property, bhkFilters: Set<BHKFilter>): boolean => {
    if (bhkFilters.size === 0) return true
    
    const config = property.metadata.configuration?.toLowerCase() || ''
    return Array.from(bhkFilters).some(bhk => config.includes(`${bhk} bhk`))
  }

  // Check if property matches possession year filter
  const matchesPossessionYear = (property: Property, yearFilters: Set<string>): boolean => {
    if (yearFilters.size === 0) return true
    
    const year = extractYear(property.metadata.possession)
    if (!year) return false
    
    return yearFilters.has(year.toString())
  }

  // Check if property matches price range filter
  const matchesPriceRange = (property: Property, rangeFilters: Set<PriceRange>): boolean => {
    if (rangeFilters.size === 0) return true
    
    const price = extractPrice(property.metadata.price)
    if (!price) return false
    
    return Array.from(rangeFilters).some(range => {
      switch (range) {
        case '0.5-1': return price >= 0.5 && price < 1
        case '1-1.5': return price >= 1 && price < 1.5
        case '1.5-2': return price >= 1.5 && price < 2
        case '2-2.5': return price >= 2 && price < 2.5
        case '2.5-4': return price >= 2.5 && price < 4
        case '4-6': return price >= 4 && price < 6
        case '6-10': return price >= 6 && price < 10
        case '10+': return price >= 10
        default: return false
      }
    })
  }

  // Filter and sort properties
  const filteredAndSortedProperties = useMemo(() => {
    // Apply filters
    let filtered = properties.filter(property => 
      matchesBHK(property, filters.bhk) &&
      matchesPossessionYear(property, filters.possessionYear) &&
      matchesPriceRange(property, filters.priceRange)
    )

    // Apply sorting
    if (sortBy !== 'default') {
      filtered = [...filtered].sort((a, b) => {
        if (sortBy === 'price-asc' || sortBy === 'price-desc') {
          const priceA = extractPrice(a.metadata.price)
          const priceB = extractPrice(b.metadata.price)
          
          // Put properties without price at the end
          if (priceA === null && priceB === null) return 0
          if (priceA === null) return 1
          if (priceB === null) return -1
          
          return sortBy === 'price-asc' ? priceA - priceB : priceB - priceA
        }
        
        if (sortBy === 'possession-asc' || sortBy === 'possession-desc') {
          const yearA = extractYear(a.metadata.possession)
          const yearB = extractYear(b.metadata.possession)
          
          // Put properties without date at the end
          if (yearA === null && yearB === null) return 0
          if (yearA === null) return 1
          if (yearB === null) return -1
          
          return sortBy === 'possession-asc' ? yearA - yearB : yearB - yearA
        }
        
        return 0
      })
    }

    return filtered
  }, [properties, sortBy, filters])

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedProperty(null), 300)
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="brand">
            <h1 className="logo">RightGhar</h1>
            <p className="tagline">Pick right. Live better</p>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <FilterSort
            sortBy={sortBy}
            filters={filters}
            onSortChange={setSortBy}
            onFilterChange={setFilters}
            propertyCount={filteredAndSortedProperties.length}
          />

          <div className="properties-grid">
            {filteredAndSortedProperties.map((property) => (
              <PropertyCard
                key={property.metadata.id}
                property={property}
                onClick={() => handlePropertyClick(property)}
              />
            ))}
          </div>

          {filteredAndSortedProperties.length === 0 && (
            <div className="no-results">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <h3>No properties found</h3>
              <p>Try adjusting your filters or search criteria</p>
            </div>
          )}
        </div>
      </main>

      <PropertyModal
        property={selectedProperty}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default App
