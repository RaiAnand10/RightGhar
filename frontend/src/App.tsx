import PropertyCard from './PropertyCard'
import PropertyModal from './PropertyModal'
import FilterSort from './FilterSort'
import { CompareButton } from './CompareButton'
import { CompareView } from './CompareView'
import MapView from './MapView'
import { usePropertyStore } from './stores/usePropertyStore'

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

  const filteredAndSortedProperties = getFilteredProperties()

  const handlePropertyClick = (property: typeof selectedProperty) => {
    if (property) {
      openModal(property)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-300">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md border-b border-black/5 px-4 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 flex-wrap md:flex-nowrap">
          <div className="text-center flex-1">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2 tracking-tight hover:scale-[1.02] transition-transform">
              RightGhar
            </h1>
            <p className="text-lg text-slate-500 tracking-wide">Pick right. Live better</p>
          </div>

          <div className="flex gap-2 bg-white p-1 rounded-xl shadow-md">
            <button
              className={`flex items-center gap-2 px-5 py-3 border-none rounded-lg text-sm font-medium cursor-pointer transition-all whitespace-nowrap ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                  : 'bg-transparent text-slate-500 hover:bg-primary/10 hover:text-primary'
              }`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/>
                <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/>
                <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/>
                <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1"/>
              </svg>
              Grid
            </button>
            <button
              className={`flex items-center gap-2 px-5 py-3 border-none rounded-lg text-sm font-medium cursor-pointer transition-all whitespace-nowrap ${
                viewMode === 'map'
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                  : 'bg-transparent text-slate-500 hover:bg-primary/10 hover:text-primary'
              }`}
              onClick={() => setViewMode('map')}
              title="Map View"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
              </svg>
              Map
            </button>
          </div>
        </div>
      </header>

      <main className="p-8 md:p-12 max-w-full">
        <div className="max-w-[calc(100%-4rem)] mx-auto">
          <FilterSort
            propertyCount={filteredAndSortedProperties.length}
            compareCount={compareList.length}
            onCompareClick={() => setCompareOpen(true)}
          />

          {viewMode === 'grid' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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

              {filteredAndSortedProperties.length === 0 && (
                <div className="text-center py-16 px-8 text-slate-500">
                  <svg className="mx-auto mb-6 text-slate-300" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <h3 className="text-2xl font-semibold text-slate-600 mb-2">No properties found</h3>
                  <p className="text-base">Try adjusting your filters or search criteria</p>
                </div>
              )}
            </>
          ) : (
            <MapView
              properties={filteredAndSortedProperties}
              onPropertyClick={handlePropertyClick}
            />
          )}
        </div>
      </main>

      <PropertyModal
        property={selectedProperty}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      <CompareButton
        count={compareList.length}
        onClick={() => setCompareOpen(true)}
      />

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
