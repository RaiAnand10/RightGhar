import { Property } from './types';
import { renderMarkdownToHtml } from './utils/markdownParser';

interface PropertyModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

function PropertyModal({ property, isOpen, onClose }: PropertyModalProps) {
  if (!isOpen || !property) return null;

  const { metadata, content } = property;

  const InfoItem = ({ label, value, isPrice = false }: { label: string; value: string | number; isPrice?: boolean }) => (
    <div className="bg-slate-50 rounded-lg p-4">
      <span className="block text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">{label}</span>
      <span className={`block text-sm font-semibold ${isPrice ? 'text-primary' : 'text-slate-800'}`}>{value}</span>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-100 border-none text-2xl text-slate-500 cursor-pointer flex items-center justify-center transition-all hover:bg-slate-200 hover:text-slate-700 z-10"
          onClick={onClose}
        >
          ×
        </button>

        <div className="p-8 pb-6 border-b border-slate-100">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            {metadata.project}
          </h1>
          <span className="text-base text-slate-500 font-medium">{metadata.builder}</span>
        </div>

        <div className="p-8 border-b border-slate-100">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <InfoItem label="Location" value={metadata.location} />
            <InfoItem label="Configuration" value={metadata.configuration} />
            <InfoItem label="Price" value={metadata.price} isPrice />
            <InfoItem label="Total Units" value={metadata.totalUnits} />
            <InfoItem label="Area" value={metadata.area} />
            <InfoItem label="Possession" value={metadata.possession} />
            <InfoItem label="Towers" value={`${metadata.towers} Towers, ${metadata.floors}`} />
            <InfoItem label="Unit Sizes" value={metadata.unitSizes} />
            <InfoItem label="Clubhouse" value={metadata.clubhouse} />
            <InfoItem label="Open Space" value={metadata.openSpace} />
            <InfoItem label="RERA" value={metadata.rera} />
          </div>
        </div>

        <div
          className="p-8 prose prose-slate max-w-none prose-headings:text-slate-800 prose-h2:text-xl prose-h2:font-bold prose-h2:mt-6 prose-h2:mb-4 prose-h3:text-lg prose-h3:font-semibold prose-p:text-slate-600 prose-li:text-slate-600"
          dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(content) }}
        />
      </div>
    </div>
  );
}

export default PropertyModal;
