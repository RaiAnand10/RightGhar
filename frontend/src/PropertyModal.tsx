import { useState } from 'react';
import { Property } from './types';
import { renderMarkdownToHtml } from './utils/markdownParser';
import { useFavoritesStore } from './stores/useFavoritesStore';

interface PropertyModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'overview' | 'amenities' | 'details';

function PropertyModal({ property, isOpen, onClose }: PropertyModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  if (!isOpen || !property) return null;

  const { metadata, content } = property;
  const favorited = isFavorite(metadata.id);

  // Parse amenities from content if available
  const parseAmenities = (content: string): string[] => {
    const amenitiesSection = content.match(/##?\s*(?:Amenities|Features|Facilities)[:\s]*\n([\s\S]*?)(?=##|$)/i);
    if (amenitiesSection) {
      const lines = amenitiesSection[1].split('\n');
      return lines
        .map(line => line.replace(/^[-*•]\s*/, '').trim())
        .filter(line => line.length > 0 && line.length < 100);
    }
    return [];
  };

  const amenities = parseAmenities(content);

  // Default amenities if none parsed
  const defaultAmenities = [
    'Swimming Pool', 'Gymnasium', 'Clubhouse', 'Children\'s Play Area',
    'Landscaped Gardens', 'Jogging Track', 'Multi-purpose Hall', 'Indoor Games',
    'Security', '24/7 Power Backup', 'Covered Parking', 'Lift'
  ];

  const displayAmenities = amenities.length > 0 ? amenities : defaultAmenities;

  const getPossessionBadge = () => {
    const possession = metadata.possession.toLowerCase();
    if (possession.includes('ready') || possession.includes('move')) {
      return { text: 'Ready to Move', className: 'bg-green-100 text-green-700' };
    } else if (possession.includes('under') || possession.includes('construction')) {
      return { text: 'Under Construction', className: 'bg-amber-100 text-amber-700' };
    } else {
      return { text: metadata.possession, className: 'bg-blue-100 text-blue-700' };
    }
  };

  const possessionBadge = getPossessionBadge();

  const InfoItem = ({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) => (
    <div className="py-3">
      <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm font-medium ${highlight ? 'text-teal-600' : 'text-stone-900'}`}>{value || 'TBD'}</p>
    </div>
  );

  const TabButton = ({ tab, label }: { tab: TabType; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
        activeTab === tab
          ? 'border-teal-500 text-teal-600'
          : 'border-transparent text-stone-500 hover:text-stone-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div
      className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-modal flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Gallery Placeholder */}
        <div className="relative h-64 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto text-stone-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <p className="text-stone-400 text-sm">Property Images Coming Soon</p>
          </div>

          {/* Badges on image */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${possessionBadge.className}`}>
              {possessionBadge.text}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-stone-800 text-white">
              {metadata.configuration}
            </span>
          </div>

          {/* Favorite & Close buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(metadata.id);
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${
                favorited
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 text-stone-600 hover:bg-white'
              }`}
              title={favorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg className="w-5 h-5" fill={favorited ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/90 text-stone-600 hover:bg-white transition-all shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Price badge */}
          <div className="absolute bottom-4 right-4">
            <span className="px-4 py-2 rounded-lg text-sm font-semibold bg-teal-500 text-white shadow-lg">
              {metadata.price || 'Price On Request'}
            </span>
          </div>
        </div>

        {/* Header with title and builder link */}
        <div className="px-6 py-4 border-b border-stone-200">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-2xl text-stone-900 mb-1">
                {metadata.project}
              </h1>
              <p className="text-sm text-stone-600 flex items-center gap-2">
                <span>{metadata.builder}</span>
                <span className="text-stone-300">•</span>
                <span>{metadata.location}</span>
              </p>
            </div>
            {metadata.url && (
              <a
                href={metadata.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                Visit Builder
              </a>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-200 px-6">
          <TabButton tab="overview" label="Overview" />
          <TabButton tab="amenities" label="Amenities" />
          <TabButton tab="details" label="Details" />
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="p-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-stone-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-display text-stone-900">{metadata.totalUnits || '—'}</p>
                  <p className="text-xs text-stone-500 uppercase tracking-wider">Units</p>
                </div>
                <div className="bg-stone-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-display text-stone-900">{metadata.towers || '—'}</p>
                  <p className="text-xs text-stone-500 uppercase tracking-wider">Towers</p>
                </div>
                <div className="bg-stone-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-display text-stone-900">{metadata.area || '—'}</p>
                  <p className="text-xs text-stone-500 uppercase tracking-wider">Area</p>
                </div>
                <div className="bg-stone-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-display text-stone-900">{metadata.floors || '—'}</p>
                  <p className="text-xs text-stone-500 uppercase tracking-wider">Floors</p>
                </div>
              </div>

              {/* About Section */}
              {content && (
                <div>
                  <h3 className="text-xs text-stone-400 uppercase tracking-wider mb-3">About This Project</h3>
                  <div
                    className="prose prose-sm prose-stone max-w-none prose-headings:font-display prose-headings:text-stone-900 prose-p:text-stone-600 prose-li:text-stone-600 prose-a:text-teal-600"
                    dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(content) }}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'amenities' && (
            <div className="p-6">
              <h3 className="text-xs text-stone-400 uppercase tracking-wider mb-4">Project Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {displayAmenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-stone-700">{amenity}</span>
                  </div>
                ))}
              </div>

              {/* Clubhouse & Open Space */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                {metadata.clubhouse && metadata.clubhouse !== 'TBD' && (
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4">
                    <p className="text-xs text-teal-600 uppercase tracking-wider mb-1">Clubhouse</p>
                    <p className="text-lg font-display text-teal-800">{metadata.clubhouse}</p>
                  </div>
                )}
                {metadata.openSpace && metadata.openSpace !== 'TBD' && (
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                    <p className="text-xs text-green-600 uppercase tracking-wider mb-1">Open Space</p>
                    <p className="text-lg font-display text-green-800">{metadata.openSpace}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="p-6">
              <h3 className="text-xs text-stone-400 uppercase tracking-wider mb-4">Project Specifications</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                <InfoItem label="Project Name" value={metadata.project} />
                <InfoItem label="Builder" value={metadata.builder} />
                <InfoItem label="Location" value={metadata.location} />
                <InfoItem label="Configuration" value={metadata.configuration} />
                <InfoItem label="Price" value={metadata.price} highlight />
                <InfoItem label="Possession" value={metadata.possession} />
                <InfoItem label="Total Units" value={metadata.totalUnits} />
                <InfoItem label="Area" value={metadata.area} />
                <InfoItem label="Towers" value={`${metadata.towers} Towers`} />
                <InfoItem label="Floors" value={metadata.floors} />
                <InfoItem label="Unit Sizes" value={metadata.unitSizes} />
                <InfoItem label="Open Space" value={metadata.openSpace} />
                <InfoItem label="Clubhouse" value={metadata.clubhouse} />
                <InfoItem label="RERA Number" value={metadata.rera} highlight />
              </div>

              {/* RERA Verification */}
              <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">RERA Registered</p>
                    <p className="text-xs text-green-600">{metadata.rera || 'Registration details available on request'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PropertyModal;
