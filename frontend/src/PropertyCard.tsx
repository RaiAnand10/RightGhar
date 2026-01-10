import { Property } from './types';
import { useFavoritesStore } from './stores/useFavoritesStore';

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
  isInCompare: boolean;
  onToggleCompare: (e: React.MouseEvent) => void;
}

function PropertyCard({ property, onClick, isInCompare, onToggleCompare }: PropertyCardProps) {
  const { metadata } = property;
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const favorited = isFavorite(metadata.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(metadata.id);
  };

  // Determine possession status for badge styling
  const getPossessionBadge = () => {
    const possession = metadata.possession?.toLowerCase() || '';
    if (possession.includes('ready') || possession.includes('completed')) {
      return { text: 'Ready to Move', className: 'bg-emerald-100 text-emerald-700' };
    } else if (possession.includes('2024') || possession.includes('2025')) {
      return { text: metadata.possession, className: 'bg-amber-100 text-amber-700' };
    }
    return { text: metadata.possession || 'TBD', className: 'bg-stone-100 text-stone-600' };
  };

  const possessionBadge = getPossessionBadge();

  return (
    <article
      className="group bg-white rounded-2xl overflow-hidden shadow-card cursor-pointer transition-all duration-300 ease-out border border-stone-100 hover:shadow-card-hover hover:border-stone-200 hover:-translate-y-1"
      onClick={onClick}
    >
      {/* Image Placeholder with Overlay Actions */}
      <div className="relative h-48 bg-gradient-to-br from-stone-100 to-stone-200">
        {/* Placeholder Pattern */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-16 h-16 text-stone-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-xs text-stone-400">Coming Soon</span>
          </div>
        </div>

        {/* Top Actions Row */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {/* Configuration Badge */}
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-semibold text-stone-700 shadow-sm">
            {metadata.configuration}
          </span>

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className={`p-2 rounded-full shadow-sm transition-all duration-200 ${
              favorited
                ? 'bg-rose-500 text-white'
                : 'bg-white/90 backdrop-blur-sm text-stone-400 hover:text-rose-500'
            }`}
            title={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg
              className="w-4 h-4"
              fill={favorited ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </button>
        </div>

        {/* Bottom Badges Row */}
        <div className="absolute bottom-3 left-3 right-3 flex gap-2">
          {/* Possession Badge */}
          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${possessionBadge.className}`}>
            {possessionBadge.text}
          </span>
          {/* Price Badge */}
          <span className="px-2.5 py-1 bg-teal-600 text-white rounded-lg text-xs font-semibold">
            {metadata.price}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="mb-3">
          <h3 className="font-display text-lg text-stone-900 leading-tight line-clamp-1 group-hover:text-teal-700 transition-colors">
            {metadata.project}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-sm text-stone-500 font-medium">{metadata.builder}</span>
            <span className="text-stone-300">•</span>
            <span className="text-sm text-stone-400 line-clamp-1">{metadata.location}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 py-3 border-y border-stone-100">
          <div className="flex-1 text-center">
            <p className="text-base font-bold text-stone-800">{metadata.totalUnits}</p>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider">Units</p>
          </div>
          <div className="w-px h-8 bg-stone-100"></div>
          <div className="flex-1 text-center">
            <p className="text-base font-bold text-stone-800">{metadata.area}</p>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider">Area</p>
          </div>
          <div className="w-px h-8 bg-stone-100"></div>
          <div className="flex-1 text-center">
            <p className="text-base font-bold text-stone-800">{metadata.towers}</p>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider">Towers</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] text-stone-400 font-mono">
            RERA: {metadata.rera}
          </span>
          <button
            onClick={onToggleCompare}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              isInCompare
                ? 'bg-teal-600 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-teal-50 hover:text-teal-600'
            }`}
          >
            {isInCompare ? '✓ Added' : '+ Compare'}
          </button>
        </div>
      </div>
    </article>
  );
}

export default PropertyCard;
