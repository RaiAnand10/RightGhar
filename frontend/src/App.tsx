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

  // Get filtered properties and apply favorites filter
  const filteredProperties = getFilteredProperties()
  const filteredAndSortedProperties = showOnlyFavorites
    ? filteredProperties.filter(p => isFavorite(p.metadata.id))
    : filteredProperties

  const handlePropertyClick = (property: typeof selectedProperty) => {
    if (property) {
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
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  {filteredAndSortedProperties.length} newly launched projects
                </p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredAndSortedProperties.map((property) => (
                  <PropertyCard
                    key={property.metadata.id}
                    property={property}
                    onClick={() => handlePropertyClick(property)}
                    isInCompare={isInCompare(property.metadata.id)}
                    onToggleCompare={(e) => {
                      e.stopPropagation()
                      toggleCompare(property)
                    }}
                  />
                ))}
              </div>
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
