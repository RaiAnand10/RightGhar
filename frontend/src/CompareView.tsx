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

  const availableProperties = allProperties.filter(
    (p) => !properties.find((cp) => cp.metadata.id === p.metadata.id)
  );

  const filteredProperties = availableProperties.filter(
    (p) =>
      p.metadata.project.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.metadata.builder.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const comparisonRows = [
    { label: 'Builder', getValue: (p: Property) => p.metadata.builder },
    { label: 'Location', getValue: (p: Property) => p.metadata.location },
    { label: 'Configuration', getValue: (p: Property) => p.metadata.configuration },
    { label: 'Price', getValue: (p: Property) => p.metadata.price, highlight: true },
    { label: 'Possession', getValue: (p: Property) => p.metadata.possession },
    { label: 'Total Units', getValue: (p: Property) => p.metadata.totalUnits?.toString() || '—' },
    { label: 'Towers', getValue: (p: Property) => p.metadata.towers?.toString() || '—' },
    { label: 'Floors', getValue: (p: Property) => p.metadata.floors || '—' },
    { label: 'Area', getValue: (p: Property) => p.metadata.area || '—' },
    { label: 'Clubhouse', getValue: (p: Property) => p.metadata.clubhouse || '—' },
    { label: 'Open Space', getValue: (p: Property) => p.metadata.openSpace || '—' },
    { label: 'RERA', getValue: (p: Property) => p.metadata.rera || '—' },
  ];

  return (
    <div
      className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden shadow-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200">
          <div>
            <h2 className="font-display text-xl text-stone-900">Compare Properties</h2>
            <p className="text-sm text-stone-400 mt-0.5">
              {properties.length} of 4 properties selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8">
            <div className="w-16 h-16 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </div>
            <h3 className="font-display text-lg text-stone-900 mb-1">No properties to compare</h3>
            <p className="text-sm text-stone-600 mb-6">Add properties from the listing to compare them</p>

            {/* Add Property Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAddDropdown(!showAddDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium transition-all hover:bg-teal-700"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Property
              </button>
              {showAddDropdown && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-stone-200 rounded-xl shadow-dropdown z-10">
                  <input
                    type="text"
                    placeholder="Search properties..."
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    className="w-full px-4 py-3 border-b border-stone-200 text-sm bg-transparent outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="max-h-60 overflow-y-auto py-2">
                    {filteredProperties.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-stone-400">No properties found</p>
                    ) : (
                      filteredProperties.slice(0, 10).map((property) => (
                        <button
                          key={property.metadata.id}
                          className="w-full px-4 py-3 text-left hover:bg-stone-50 transition-colors"
                          onClick={() => {
                            onAddProperty(property);
                            setShowAddDropdown(false);
                            setProjectSearch('');
                          }}
                        >
                          <p className="text-sm font-medium text-stone-900">{property.metadata.project}</p>
                          <p className="text-xs text-stone-400">{property.metadata.builder}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="sticky left-0 bg-white px-6 py-4 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider min-w-[140px]">
                    Property
                  </th>
                  {properties.map((property) => (
                    <th key={property.metadata.id} className="px-6 py-4 text-left min-w-[200px]">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-display text-base text-stone-900">{property.metadata.project}</p>
                          <p className="text-xs text-stone-400 mt-0.5">{property.metadata.builder}</p>
                        </div>
                        <button
                          onClick={() => onRemove(property.metadata.id)}
                          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Remove"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </th>
                  ))}
                  {properties.length < 4 && (
                    <th className="px-6 py-4 min-w-[160px]">
                      <div className="relative">
                        <button
                          onClick={() => setShowAddDropdown(!showAddDropdown)}
                          className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-stone-200 rounded-lg text-sm font-medium text-stone-400 hover:border-teal-600 hover:text-teal-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                          Add
                        </button>
                        {showAddDropdown && (
                          <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-stone-200 rounded-xl shadow-dropdown z-10">
                            <input
                              type="text"
                              placeholder="Search properties..."
                              value={projectSearch}
                              onChange={(e) => setProjectSearch(e.target.value)}
                              className="w-full px-4 py-3 border-b border-stone-200 text-sm bg-transparent outline-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="max-h-60 overflow-y-auto py-2">
                              {filteredProperties.length === 0 ? (
                                <p className="px-4 py-3 text-sm text-stone-400">No properties found</p>
                              ) : (
                                filteredProperties.slice(0, 10).map((property) => (
                                  <button
                                    key={property.metadata.id}
                                    className="w-full px-4 py-3 text-left hover:bg-stone-50 transition-colors"
                                    onClick={() => {
                                      onAddProperty(property);
                                      setShowAddDropdown(false);
                                      setProjectSearch('');
                                    }}
                                  >
                                    <p className="text-sm font-medium text-stone-900">{property.metadata.project}</p>
                                    <p className="text-xs text-stone-400">{property.metadata.builder}</p>
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, index) => (
                  <tr key={index} className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
                    <td className="sticky left-0 bg-white px-6 py-4 text-sm font-medium text-stone-600">
                      {row.label}
                    </td>
                    {properties.map((property) => (
                      <td
                        key={property.metadata.id}
                        className={`px-6 py-4 text-sm ${row.highlight ? 'text-teal-600 font-semibold' : 'text-stone-900'}`}
                      >
                        {row.getValue(property)}
                      </td>
                    ))}
                    {properties.length < 4 && (
                      <td className="px-6 py-4" />
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
