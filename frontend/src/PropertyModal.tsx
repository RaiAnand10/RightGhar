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

  const InfoItem = ({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) => (
    <div className="py-3 border-b border-stone-100 last:border-0">
      <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm font-medium ${highlight ? 'text-teal-600' : 'text-stone-900'}`}>{value}</p>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-5 flex items-start justify-between z-10">
          <div>
            <h1 className="font-display text-2xl text-stone-900 mb-1">
              {metadata.project}
            </h1>
            <p className="text-sm text-stone-600">{metadata.builder}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-stone-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quick Info Grid */}
        <div className="px-6 py-6 border-b border-stone-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="col-span-2 md:col-span-1">
              <InfoItem label="Price" value={metadata.price} highlight />
            </div>
            <InfoItem label="Location" value={metadata.location} />
            <InfoItem label="Configuration" value={metadata.configuration} />
            <InfoItem label="Possession" value={metadata.possession} />
          </div>
        </div>

        {/* Details Grid */}
        <div className="px-6 py-6 border-b border-stone-200">
          <h2 className="text-xs text-stone-400 uppercase tracking-wider mb-4">Project Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6">
            <InfoItem label="Total Units" value={metadata.totalUnits} />
            <InfoItem label="Area" value={metadata.area} />
            <InfoItem label="Towers" value={`${metadata.towers} Towers`} />
            <InfoItem label="Floors" value={metadata.floors} />
            <InfoItem label="Unit Sizes" value={metadata.unitSizes} />
            <InfoItem label="Open Space" value={metadata.openSpace} />
            <InfoItem label="Clubhouse" value={metadata.clubhouse} />
            <InfoItem label="RERA" value={metadata.rera} />
          </div>
        </div>

        {/* Content */}
        {content && (
          <div className="px-6 py-6">
            <h2 className="text-xs text-stone-400 uppercase tracking-wider mb-4">About</h2>
            <div
              className="prose prose-sm prose-stone max-w-none prose-headings:font-display prose-headings:text-stone-900 prose-p:text-stone-600 prose-li:text-stone-600 prose-a:text-teal-600"
              dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(content) }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default PropertyModal;
