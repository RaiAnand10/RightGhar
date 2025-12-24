import { Property } from './data';
import './PropertyCard.css';

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
  isInCompare: boolean;
  onToggleCompare: (e: React.MouseEvent) => void;
}

function PropertyCard({ property, onClick, isInCompare, onToggleCompare }: PropertyCardProps) {
  const { metadata } = property;

  return (
    <div className="property-card" onClick={onClick}>
      <div className="compare-checkbox-wrapper" onClick={onToggleCompare}>
        <input
          type="checkbox"
          className="compare-checkbox"
          checked={isInCompare}
          onChange={() => {}}
          title={isInCompare ? 'Remove from comparison' : 'Add to comparison'}
        />
        <span className="compare-checkbox-label">Compare</span>
      </div>
      
      <div className="property-card-header">
        <h3 className="property-name">{metadata.project}</h3>
        <span className="property-builder">{metadata.builder}</span>
      </div>
      
      <div className="property-card-body">
        <div className="property-info-row">
          <span className="info-label">📍 Location:</span>
          <span className="info-value">{metadata.location}</span>
        </div>
        
        <div className="property-info-row">
          <span className="info-label">🏠 Configuration:</span>
          <span className="info-value">{metadata.configuration}</span>
        </div>
        
        <div className="property-info-row">
          <span className="info-label">💰 Price:</span>
          <span className="info-value price">{metadata.price}</span>
        </div>
        
        <div className="property-stats">
          <div className="stat">
            <span className="stat-value">{metadata.totalUnits}</span>
            <span className="stat-label">Units</span>
          </div>
          <div className="stat">
            <span className="stat-value">{metadata.area}</span>
            <span className="stat-label">Area</span>
          </div>
          <div className="stat">
            <span className="stat-value">{metadata.towers}</span>
            <span className="stat-label">Towers</span>
          </div>
        </div>
      </div>
      
      <div className="property-card-footer">
        <span className="rera-badge">RERA: {metadata.rera}</span>
        <span className="view-details">View Details →</span>
      </div>
    </div>
  );
}

export default PropertyCard;
