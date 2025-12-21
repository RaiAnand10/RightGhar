import { useState } from 'react'
import './App.css'
import PropertyCard from './PropertyCard'
import PropertyModal from './PropertyModal'
import { properties, Property } from './data'

function App() {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
          <div className="properties-grid">
            {properties.map((property) => (
              <PropertyCard
                key={property.metadata.id}
                property={property}
                onClick={() => handlePropertyClick(property)}
              />
            ))}
          </div>
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
