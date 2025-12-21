import { Property } from './data';
import './PropertyModal.css';

interface PropertyModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

function PropertyModal({ property, isOpen, onClose }: PropertyModalProps) {
  if (!isOpen || !property) return null;

  const { metadata, content } = property;

  // Convert markdown to HTML (basic conversion)
  const renderContent = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        // Headers
        if (line.startsWith('### ')) {
          return `<h3 key="${index}">${line.substring(4)}</h3>`;
        }
        if (line.startsWith('## ')) {
          return `<h2 key="${index}">${line.substring(3)}</h2>`;
        }
        if (line.startsWith('# ')) {
          return `<h1 key="${index}">${line.substring(2)}</h1>`;
        }
        // Lists
        if (line.startsWith('- ')) {
          return `<li key="${index}">${line.substring(2)}</li>`;
        }
        // Bold
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Paragraphs
        if (line.trim() !== '') {
          return `<p key="${index}">${line}</p>`;
        }
        return '';
      })
      .join('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h1 className="modal-title">{metadata.project}</h1>
          <span className="modal-builder">{metadata.builder}</span>
        </div>

        <div className="modal-quick-info">
          <div className="quick-info-grid">
            <div className="quick-info-item">
              <span className="quick-info-label">Location</span>
              <span className="quick-info-value">{metadata.location}</span>
            </div>
            <div className="quick-info-item">
              <span className="quick-info-label">Configuration</span>
              <span className="quick-info-value">{metadata.configuration}</span>
            </div>
            <div className="quick-info-item">
              <span className="quick-info-label">Price</span>
              <span className="quick-info-value price">{metadata.price}</span>
            </div>
            <div className="quick-info-item">
              <span className="quick-info-label">Total Units</span>
              <span className="quick-info-value">{metadata.totalUnits}</span>
            </div>
            <div className="quick-info-item">
              <span className="quick-info-label">Area</span>
              <span className="quick-info-value">{metadata.area}</span>
            </div>
            <div className="quick-info-item">
              <span className="quick-info-label">Possession</span>
              <span className="quick-info-value">{metadata.possession}</span>
            </div>
            <div className="quick-info-item">
              <span className="quick-info-label">Towers</span>
              <span className="quick-info-value">{metadata.towers} Towers, {metadata.floors}</span>
            </div>
            <div className="quick-info-item">
              <span className="quick-info-label">Unit Sizes</span>
              <span className="quick-info-value">{metadata.unitSizes}</span>
            </div>
            <div className="quick-info-item">
              <span className="quick-info-label">Clubhouse</span>
              <span className="quick-info-value">{metadata.clubhouse}</span>
            </div>
            <div className="quick-info-item">
              <span className="quick-info-label">Open Space</span>
              <span className="quick-info-value">{metadata.openSpace}</span>
            </div>
            <div className="quick-info-item">
              <span className="quick-info-label">RERA</span>
              <span className="quick-info-value">{metadata.rera}</span>
            </div>
          </div>
        </div>

        <div 
          className="modal-body"
          dangerouslySetInnerHTML={{ __html: renderContent(content) }}
        />
      </div>
    </div>
  );
}

export default PropertyModal;
