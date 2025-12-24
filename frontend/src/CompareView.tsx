import React from 'react';
import { Property } from './data';
import './CompareView.css';

interface CompareViewProps {
  properties: Property[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onAddMore: () => void;
  allProperties: Property[];
  onAddProperty: (property: Property) => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  properties,
  onClose,
  onRemove,
  allProperties,
  onAddProperty,
}) => {
  const [showAddDropdown, setShowAddDropdown] = React.useState(false);

  // Filter out already selected properties
  const availableProperties = allProperties.filter(
    (p) => !properties.find((cp) => cp.metadata.id === p.metadata.id)
  );

  const comparisonRows = [
    { label: 'Builder', getValue: (p: Property) => p.metadata.builder },
    { label: 'Location', getValue: (p: Property) => p.metadata.location },
    { label: 'Configuration', getValue: (p: Property) => p.metadata.configuration },
    { label: 'Price', getValue: (p: Property) => p.metadata.price },
    { label: 'Possession', getValue: (p: Property) => p.metadata.possession },
    { label: 'Total Units', getValue: (p: Property) => p.metadata.totalUnits?.toString() || 'N/A' },
    { label: 'Towers', getValue: (p: Property) => p.metadata.towers?.toString() || 'N/A' },
    { label: 'Floors', getValue: (p: Property) => p.metadata.floors || 'N/A' },
    { label: 'Area', getValue: (p: Property) => p.metadata.area || 'N/A' },
    { label: 'RERA', getValue: (p: Property) => p.metadata.rera || 'N/A' },
    { label: 'Clubhouse', getValue: (p: Property) => p.metadata.clubhouse || 'N/A' },
    { label: 'Open Space', getValue: (p: Property) => p.metadata.openSpace || 'N/A' },
  ];

  return (
    <div className="compare-overlay" onClick={onClose}>
      <div className="compare-modal" onClick={(e) => e.stopPropagation()}>
        <div className="compare-header">
          <h2>Compare Projects</h2>
          <button className="compare-close-button" onClick={onClose}>
            ×
          </button>
        </div>

        {properties.length === 0 ? (
          <div className="compare-empty">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p>No projects selected for comparison</p>
            <p className="compare-empty-hint">
              Select projects below to start comparing
            </p>
            <div className="compare-empty-dropdown-wrapper">
              <button
                className="compare-empty-add-btn"
                onClick={() => setShowAddDropdown(!showAddDropdown)}
              >
                + Add Project to Compare
              </button>
              {showAddDropdown && availableProperties.length > 0 && (
                <div className="compare-empty-dropdown">
                  {availableProperties.map((property) => (
                    <div
                      key={property.metadata.id}
                      className="compare-add-option"
                      onClick={() => {
                        onAddProperty(property);
                        setShowAddDropdown(false);
                      }}
                    >
                      <div className="compare-add-option-name">
                        {property.metadata.project}
                      </div>
                      <div className="compare-add-option-builder">
                        {property.metadata.builder}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="compare-table-wrapper">
            <table className="compare-table">
              <thead>
                <tr>
                  <th className="compare-param-header">Parameter</th>
                  {properties.map((property) => (
                    <th key={property.metadata.id} className="compare-property-header">
                      <div className="compare-property-name">
                        <span>{property.metadata.project}</span>
                        <button
                          className="compare-remove-btn"
                          onClick={() => onRemove(property.metadata.id)}
                          title="Remove from comparison"
                        >
                          ×
                        </button>
                      </div>
                    </th>
                  ))}
                  {properties.length < 4 && (
                    <th className="compare-add-column">
                      <div className="compare-add-wrapper">
                        <button
                          className="compare-add-btn"
                          onClick={() => setShowAddDropdown(!showAddDropdown)}
                        >
                          + Add Project
                        </button>
                        {showAddDropdown && availableProperties.length > 0 && (
                          <div className="compare-add-dropdown">
                            {availableProperties.map((property) => (
                              <div
                                key={property.metadata.id}
                                className="compare-add-option"
                                onClick={() => {
                                  onAddProperty(property);
                                  setShowAddDropdown(false);
                                }}
                              >
                                <div className="compare-add-option-name">
                                  {property.metadata.project}
                                </div>
                                <div className="compare-add-option-builder">
                                  {property.metadata.builder}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, index) => (
                  <tr key={index}>
                    <td className="compare-param-cell">{row.label}</td>
                    {properties.map((property) => (
                      <td key={property.metadata.id} className="compare-value-cell">
                        {row.getValue(property)}
                      </td>
                    ))}
                    {properties.length < 4 && (
                      <td className="compare-add-cell"></td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
