import { useState, useEffect } from 'react'
import PropertyCard from './PropertyCard'
import PropertyModal from './PropertyModal'
import FilterSort from './FilterSort'
import { CompareButton } from './CompareButton'
import { CompareView } from './CompareView'
import MapView from './MapView'
import { Navbar } from './components/Navbar'
import { HeroSection } from './components/HeroSection'
import { ValueProposition } from './components/ValueProposition'
import { Footer } from './components/Footer'
import { usePropertyStore } from './stores/usePropertyStore'
import { useFavoritesStore } from './stores/useFavoritesStore'

// Number of properties to show per page (3 columns x 5 rows = 15)
const PROPERTIES_PER_PAGE = 15

function App() {
  const {
    viewMode,
    setViewMode,
    isCompareOpen,
    setCompareOpen,
    compareList,
    isModalOpen,
    selectedProperty,
    closeModal,
    openModal,
    getFilteredProperties,
    allProperties,
    removeFromCompare,
    addToCompare,
    toggleCompare,
    isInCompare,
  } = usePropertyStore()

  const { showOnlyFavorites, isFavorite } = useFavoritesStore()

  // Pagination state
  const [visibleCount, setVisibleCount] = useState(PROPERTIES_PER_PAGE)
  // Initial tab for modal (used when opening from Add Quote button)
  const [initialModalTab, setInitialModalTab] = useState<'overview' | 'amenities' | 'details' | 'prices' | 'reviews' | 'gallery' | 'notes'>('overview')

  // Listen for openCompare event from footer
  useEffect(() => {
    const handleOpenCompare = () => setCompareOpen(true);
    window.addEventListener('openCompare', handleOpenCompare);
    return () => window.removeEventListener('openCompare', handleOpenCompare);
  }, [setCompareOpen]);

  // Get filtered properties and apply favorites filter
  const filteredProperties = getFilteredProperties()
  const filteredAndSortedProperties = showOnlyFavorites
    ? filteredProperties.filter(p => isFavorite(p.metadata.id))
    : filteredProperties

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PROPERTIES_PER_PAGE)
  }, [filteredAndSortedProperties.length])

  // Get only the visible properties
  const visibleProperties = filteredAndSortedProperties.slice(0, visibleCount)
  const hasMoreProperties = visibleCount < filteredAndSortedProperties.length
  const remainingCount = filteredAndSortedProperties.length - visibleCount

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + PROPERTIES_PER_PAGE)
  }

  const handlePropertyClick = (property: typeof selectedProperty) => {
    if (property) {
      setInitialModalTab('overview')
      openModal(property)
    }
  }

  const handleAddQuote = (property: typeof selectedProperty, e: React.MouseEvent) => {
    e.stopPropagation()
    if (property) {
      setInitialModalTab('prices')
      openModal(property)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Fixed Navigation */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Value Proposition */}
      <ValueProposition />

      {/* Properties Section */}
      <div id="properties-section">
        {/* Section Header */}
        <div className="bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Section Title */}
              <div>
                <h2 className="font-display text-xl sm:text-2xl text-stone-900">
                  Browse Properties
                </h2>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 p-1 bg-stone-50 rounded-lg border border-stone-200 self-start sm:self-auto">
                <button
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-400 hover:text-stone-600'
                  }`}
                  onClick={() => setViewMode('grid')}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === 'map'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-400 hover:text-stone-600'
                  }`}
                  onClick={() => setViewMode('map')}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span className="hidden sm:inline">Map</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Filters */}
        <FilterSort
          propertyCount={filteredAndSortedProperties.length}
          compareCount={compareList.length}
          onCompareClick={() => setCompareOpen(true)}
        />

        {/* Results */}
        {viewMode === 'grid' ? (
          <>
            {filteredAndSortedProperties.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {visibleProperties.map((property) => (
                    <PropertyCard
                      key={property.metadata.id}
                      property={property}
                      onClick={() => handlePropertyClick(property)}
                      isInCompare={isInCompare(property.metadata.id)}
                      onToggleCompare={(e) => {
                        e.stopPropagation()
                        toggleCompare(property)
                      }}
                      onAddQuote={(e) => handleAddQuote(property, e)}
                    />
                  ))}
                </div>
                
                {/* Load More Button */}
                {hasMoreProperties && (
                  <div className="flex flex-col items-center mt-8 sm:mt-12">
                    <button
                      onClick={handleLoadMore}
                      className="group flex items-center gap-2 px-8 py-3 bg-white border-2 border-stone-200 hover:border-emerald-500 text-stone-700 hover:text-emerald-600 rounded-full font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <span>Load More Properties</span>
                      <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <p className="text-sm text-stone-500 mt-3">
                      Showing {visibleCount} of {filteredAndSortedProperties.length} properties
                      {remainingCount > 0 && ` • ${remainingCount} more available`}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-white border border-stone-200 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <h3 className="font-display text-xl text-stone-900 mb-2">No properties found</h3>
                <p className="text-sm text-stone-600 max-w-sm">
                  Try adjusting your filters to see more results
                </p>
              </div>
            )}
          </>
        ) : (
          <MapView
            properties={filteredAndSortedProperties}
            onPropertyClick={handlePropertyClick}
          />
        )}
      </main>
      </div> {/* End properties-section */}

      {/* Footer */}
      <Footer />

      {/* Property Modal */}
      <PropertyModal
        property={selectedProperty}
        isOpen={isModalOpen}
        onClose={closeModal}
        initialTab={initialModalTab}
      />

      {/* Compare Button */}
      <CompareButton
        count={compareList.length}
        onClick={() => setCompareOpen(true)}
      />

      {/* Compare View */}
      {isCompareOpen && (
        <CompareView
          properties={compareList}
          allProperties={allProperties}
          onClose={() => setCompareOpen(false)}
          onRemove={removeFromCompare}
          onAddProperty={addToCompare}
        />
      )}
    </div>
  )
}

export default App
