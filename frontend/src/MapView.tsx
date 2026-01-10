import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Property } from './types';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapViewProps {
  properties: Property[];
  onPropertyClick: (property: Property) => void;
}

function MapView({ properties, onPropertyClick }: MapViewProps) {
  // Calculate center based on all properties
  const center: [number, number] = properties.length > 0
    ? [
        properties.reduce((sum, p) => sum + (parseFloat(p.metadata.lat) || 0), 0) / properties.length,
        properties.reduce((sum, p) => sum + (parseFloat(p.metadata.lng) || 0), 0) / properties.length,
      ]
    : [17.4400, 78.3489]; // Default: Hyderabad center

  useEffect(() => {
    // Force resize observer update when map is mounted
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }, []);

  return (
    <div className="h-[600px] rounded-2xl overflow-hidden shadow-card border border-black/5">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {properties.map((property) => {
          const { lat, lng } = property.metadata;
          if (!lat || !lng) return null;

          return (
            <Marker
              key={property.metadata.id}
              position={[parseFloat(lat), parseFloat(lng)]}
              icon={icon}
              eventHandlers={{
                click: () => onPropertyClick(property),
              }}
            >
              <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                <div className="p-1">
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">{property.metadata.project}</h3>
                  <p className="text-xs text-slate-500 mb-0.5">{property.metadata.builder}</p>
                  <p className="text-xs text-slate-600 mb-0.5">{property.metadata.configuration}</p>
                  <p className="text-sm font-bold text-primary">{property.metadata.price}</p>
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default MapView;
