import { useState } from 'react';
import { Property } from './types';

interface CompareViewProps {
  properties: Property[];
  onClose: () => void;
  onRemove: (id: string) => void;
  allProperties: Property[];
  onAddProperty: (property: Property) => void;
}

export function CompareView({
  properties,
  onClose,
  onRemove,
  allProperties,
  onAddProperty,
}: CompareViewProps) {
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');

  // Filter out already selected properties
  const availableProperties = allProperties.filter(
    (p) => !properties.find((cp) => cp.metadata.id === p.metadata.id)
  );

  // Apply search filter
  const filteredProperties = availableProperties.filter(
    (p) =>
      p.metadata.project.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.metadata.builder.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const handleToggleDropdown = () => {
    if (showAddDropdown) {
      setProjectSearch('');
    }
    setShowAddDropdown(!showAddDropdown);
  };

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

  const AddDropdown = () => (
    <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-dropdown z-50">
      <input
        type="text"
        className="w-full px-4 py-3 border-none border-b border-slate-200 text-sm outline-none bg-primary/5 focus:bg-white"
        placeholder="Search projects..."
        value={projectSearch}
        onChange={(e) => setProjectSearch(e.target.value)}
        autoFocus
        onClick={(e) => e.stopPropagation()}
      />
      <div className="max-h-60 overflow-y-auto">
        {filteredProperties.length === 0 ? (
          <div className="p-4 text-center text-slate-400 text-sm">No projects found</div>
        ) : (
          filteredProperties.map((property) => (
            <div
              key={property.metadata.id}
              className="px-4 py-3 cursor-pointer transition-colors hover:bg-primary/5 border-b border-slate-100 last:border-b-0"
              onClick={() => {
                onAddProperty(property);
                setShowAddDropdown(false);
                setProjectSearch('');
              }}
            >
              <div className="text-sm font-semibold text-slate-800">{property.metadata.project}</div>
              <div className="text-xs text-slate-500">{property.metadata.builder}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800">Compare Projects</h2>
          <button
            className="w-10 h-10 rounded-full bg-slate-100 border-none text-2xl text-slate-500 cursor-pointer flex items-center justify-center transition-all hover:bg-slate-200 hover:text-slate-700"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-slate-400">
            <svg
              className="mb-4"
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
            <p className="text-lg mb-2">No projects selected for comparison</p>
            <p className="text-sm text-slate-400 mb-6">Select projects below to start comparing</p>
            <div className="relative">
              <button
                className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white border-none rounded-lg font-semibold cursor-pointer transition-all hover:shadow-lg"
                onClick={handleToggleDropdown}
              >
                + Add Project to Compare
              </button>
              {showAddDropdown && availableProperties.length > 0 && <AddDropdown />}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="sticky left-0 bg-slate-50 px-6 py-4 text-left text-sm font-semibold text-slate-600 border-b border-slate-200 min-w-[140px]">
                    Parameter
                  </th>
                  {properties.map((property) => (
                    <th
                      key={property.metadata.id}
                      className="px-6 py-4 text-left border-b border-slate-200 min-w-[200px]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-primary">{property.metadata.project}</span>
                        <button
                          className="w-6 h-6 rounded-full bg-red-100 border-none text-red-500 text-sm cursor-pointer flex items-center justify-center transition-all hover:bg-red-200"
                          onClick={() => onRemove(property.metadata.id)}
                          title="Remove from comparison"
                        >
                          ×
                        </button>
                      </div>
                    </th>
                  ))}
                  {properties.length < 4 && (
                    <th className="px-6 py-4 border-b border-slate-200 min-w-[160px]">
                      <div className="relative">
                        <button
                          className="px-4 py-2 bg-primary/10 text-primary border-2 border-dashed border-primary/30 rounded-lg text-sm font-medium cursor-pointer transition-all hover:bg-primary/20 hover:border-primary/50"
                          onClick={handleToggleDropdown}
                        >
                          + Add Project
                        </button>
                        {showAddDropdown && availableProperties.length > 0 && <AddDropdown />}
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="sticky left-0 bg-white px-6 py-4 text-sm font-medium text-slate-600 border-b border-slate-100">
                      {row.label}
                    </td>
                    {properties.map((property) => (
                      <td
                        key={property.metadata.id}
                        className="px-6 py-4 text-sm text-slate-800 border-b border-slate-100"
                      >
                        {row.getValue(property)}
                      </td>
                    ))}
                    {properties.length < 4 && (
                      <td className="px-6 py-4 border-b border-slate-100"></td>
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
}
