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
    <div
      className="bg-white rounded-2xl p-6 shadow-card cursor-pointer transition-all duration-300 border border-black/5 relative hover:-translate-y-1 hover:shadow-card-hover hover:border-primary/30"
      onClick={onClick}
    >
      <div
        className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-white border-2 border-slate-200 rounded-lg cursor-pointer transition-all z-10 hover:border-primary hover:bg-primary/5"
        onClick={onToggleCompare}
      >
        <input
          type="checkbox"
          className={`w-4 h-4 cursor-pointer appearance-none border-2 border-slate-300 rounded transition-all relative hover:border-primary ${
            isInCompare ? 'bg-gradient-to-r from-primary to-secondary border-primary' : 'bg-white'
          }`}
          checked={isInCompare}
          onChange={() => {}}
          title={isInCompare ? 'Remove from comparison' : 'Add to comparison'}
        />
        <span className="text-sm font-semibold text-primary select-none">Compare</span>
      </div>

      <div className="mb-5 pb-4 border-b border-black/10">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
          {metadata.project}
        </h3>
        <span className="text-sm text-slate-500 font-medium">{metadata.builder}</span>
      </div>

      <div className="mb-5">
        <div className="flex items-start mb-3 gap-2">
          <span className="text-sm text-slate-500 min-w-[120px] font-medium">📍 Location:</span>
          <span className="text-sm text-slate-800 font-medium flex-1">{metadata.location}</span>
        </div>

        <div className="flex items-start mb-3 gap-2">
          <span className="text-sm text-slate-500 min-w-[120px] font-medium">🏠 Configuration:</span>
          <span className="text-sm text-slate-800 font-medium flex-1">{metadata.configuration}</span>
        </div>

        <div className="flex items-start mb-3 gap-2">
          <span className="text-sm text-slate-500 min-w-[120px] font-medium">💰 Price:</span>
          <span className="text-base text-primary font-bold flex-1">{metadata.price}</span>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-black/10">
          <div className="flex flex-col items-center text-center">
            <span className="text-lg font-bold text-primary mb-1">{metadata.totalUnits}</span>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Units</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-lg font-bold text-primary mb-1">{metadata.area}</span>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Area</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-lg font-bold text-primary mb-1">{metadata.towers}</span>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Towers</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-black/10">
        <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md font-medium">
          RERA: {metadata.rera}
        </span>
        <span className="text-sm text-primary font-semibold transition-transform group-hover:translate-x-1">
          View Details →
        </span>
      </div>
    </div>
  );
}

export default PropertyCard;
