import { Property } from './types';

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
  isInCompare: boolean;
  onToggleCompare: (e: React.MouseEvent) => void;
}

function PropertyCard({ property, onClick, isInCompare, onToggleCompare }: PropertyCardProps) {
  const { metadata } = property;

  return (
    <article
      className="group bg-white rounded-xl p-6 shadow-card cursor-pointer transition-all duration-300 ease-out border border-stone-100 hover:shadow-card-hover hover:border-stone-200 hover:-translate-y-0.5"
      onClick={onClick}
    >
      {/* Header */}
      <header className="mb-5">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="font-display text-xl text-stone-900 leading-tight">
            {metadata.project}
          </h3>
          <button
            onClick={onToggleCompare}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              isInCompare
                ? 'bg-teal-600 text-white'
                : 'bg-stone-50 text-stone-600 border border-stone-200 hover:border-teal-600 hover:text-teal-600'
            }`}
          >
            {isInCompare ? '✓ Compare' : '+ Compare'}
          </button>
        </div>
        <p className="text-sm text-stone-400 font-medium">
          {metadata.builder}
        </p>
      </header>

      {/* Key Info */}
      <div className="space-y-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="w-5 text-stone-400 text-center">◎</span>
          <span className="text-sm text-stone-600">{metadata.location}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-5 text-stone-400 text-center">⊞</span>
          <span className="text-sm text-stone-600">{metadata.configuration}</span>
        </div>
      </div>

      {/* Price - Featured */}
      <div className="py-4 mb-5 border-y border-stone-100">
        <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Price</p>
        <p className="text-lg font-semibold text-teal-600">{metadata.price}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="text-center">
          <p className="text-lg font-semibold text-stone-900">{metadata.totalUnits}</p>
          <p className="text-xs text-stone-400 uppercase tracking-wide">Units</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-stone-900">{metadata.area}</p>
          <p className="text-xs text-stone-400 uppercase tracking-wide">Area</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-stone-900">{metadata.towers}</p>
          <p className="text-xs text-stone-400 uppercase tracking-wide">Towers</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between pt-4 border-t border-stone-100">
        <span className="text-xs text-stone-400 font-mono">
          {metadata.rera}
        </span>
        <span className="text-sm text-teal-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          View details →
        </span>
      </footer>
    </article>
  );
}

export default PropertyCard;
