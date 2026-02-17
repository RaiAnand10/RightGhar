import { useState, useEffect, useCallback } from 'react';
import { Property } from './types';
import { renderMarkdownToHtml } from './utils/markdownParser';
import { useFavoritesStore } from './stores/useFavoritesStore';
import { usePropertyStore } from './stores/usePropertyStore';
import {
  fetchQuotes, submitQuote, PriceQuoteSummary,
  fetchReviews, submitReview, ReviewSummary,
  fetchNote, saveNote,
} from './api';

interface PropertyModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: TabType;
}

type TabType = 'overview' | 'amenities' | 'details' | 'prices' | 'reviews' | 'gallery' | 'notes';

function PropertyModal({ property, isOpen, onClose, initialTab = 'overview' }: PropertyModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { toggleCompare, isInCompare } = usePropertyStore();

  // Price quote state
  const [priceQuote, setPriceQuote] = useState('');
  const [quoteConfig, setQuoteConfig] = useState('');
  const [quoteSummary, setQuoteSummary] = useState<PriceQuoteSummary | null>(null);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);

  // Review state
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Notes state
  const [userNote, setUserNote] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSavedAt, setNoteSavedAt] = useState<string | null>(null);

  const slug = property?.metadata.id ?? '';

  // Load quotes when prices tab is selected
  const loadQuotes = useCallback(async () => {
    if (!slug) return;
    setQuotesLoading(true);
    try {
      const data = await fetchQuotes(slug);
      setQuoteSummary(data);
    } catch { /* ignore */ }
    setQuotesLoading(false);
  }, [slug]);

  // Load reviews when reviews tab is selected
  const loadReviews = useCallback(async () => {
    if (!slug) return;
    setReviewsLoading(true);
    try {
      const data = await fetchReviews(slug);
      setReviewSummary(data);
      // Pre-fill form with own review if exists
      const mine = data.reviews.find(r => r.is_mine);
      if (mine) {
        setReviewRating(mine.rating);
        setReviewText(mine.review_text);
      }
    } catch { /* ignore */ }
    setReviewsLoading(false);
  }, [slug]);

  // Load note when notes tab is selected
  const loadNote = useCallback(async () => {
    if (!slug) return;
    setNoteLoading(true);
    try {
      const data = await fetchNote(slug);
      if (data && data.note_text) {
        setUserNote(data.note_text);
        setNoteSavedAt(data.updated_at);
      } else {
        setUserNote('');
        setNoteSavedAt(null);
      }
    } catch { /* ignore */ }
    setNoteLoading(false);
  }, [slug]);

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === 'prices') loadQuotes();
    if (activeTab === 'reviews') loadReviews();
    if (activeTab === 'notes') loadNote();
  }, [activeTab, slug, loadQuotes, loadReviews, loadNote]);

  // Reset tab when initialTab or property changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, property?.metadata.id]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Lock scroll on both body and html for cross-browser support
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !property) return null;

  const { metadata, content } = property;
  const favorited = isFavorite(metadata.id);
  const inCompare = isInCompare(metadata.id);

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

  // Filter content to only show Overview and Standout Features (exclude Amenities, Location sections)
  const filterContentForOverview = (content: string): string => {
    // Split by ## headers and only keep Overview and Standout Features sections
    const sections = content.split(/(?=^##\s)/m);
    const allowedSections = sections.filter(section => {
      const headerMatch = section.match(/^##\s*(.+)/m);
      if (!headerMatch) return true; // Keep content before first ##
      const header = headerMatch[1].toLowerCase();
      // Keep overview and standout features, exclude amenities/location
      const excludePatterns = ['amenities', 'facilities', 'location', 'nearby', 'connectivity', 'clubhouse', 'outdoor'];
      return !excludePatterns.some(pattern => header.includes(pattern));
    });
    return allowedSections.join('');
  };

  const amenities = parseAmenities(content);
  const overviewContent = filterContentForOverview(content);

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
      className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-6xl w-full h-[95vh] overflow-hidden shadow-modal flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Gallery Placeholder */}
        <div className="relative h-56 sm:h-80 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
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

          {/* Top right buttons: Compare | Favorite | Close */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (property) toggleCompare(property);
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${
                inCompare
                  ? 'bg-teal-500 text-white'
                  : 'bg-white/90 text-stone-600 hover:bg-white'
              }`}
              title={inCompare ? 'Remove from compare' : 'Add to compare'}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </button>
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

          {/* Price badge and Share Price button */}
          <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
            <span className="px-4 py-2 rounded-lg text-sm font-semibold bg-teal-500 text-white shadow-lg">
              {metadata.price || 'On Request'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('prices');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-lg"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Share Price
            </button>
          </div>
        </div>

        {/* Header with title */}
        <div className="px-6 py-4 border-b border-stone-200">
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
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-200 px-6 overflow-x-auto">
          <TabButton tab="overview" label="Overview" />
          <TabButton tab="amenities" label="Amenities" />
          <TabButton tab="details" label="Details" />
          <TabButton tab="prices" label="💰 Prices" />
          <TabButton tab="reviews" label="Reviews" />
          <TabButton tab="gallery" label="Gallery" />
          <TabButton tab="notes" label="My Notes" />
        </div>

        {/* Tab Content - Scrollable area fills remaining space */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="p-6 h-full">
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
              {overviewContent && (
                <div>
                  <h3 className="text-xs text-stone-400 uppercase tracking-wider mb-3">About This Project</h3>
                  <div
                    className="prose prose-sm prose-stone max-w-none prose-headings:font-display prose-headings:text-stone-900 prose-p:text-stone-600 prose-li:text-stone-600 prose-a:text-teal-600"
                    dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(overviewContent) }}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'amenities' && (
            <div className="p-6 h-full">
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
            <div className="p-6 h-full">
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

              {/* Visit Builder Link - placed at bottom of details */}
              {metadata.url && (
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <a
                    href={metadata.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    Visit builder website for more information
                  </a>
                </div>
              )}
            </div>
          )}

          {/* PRICES TAB */}
          {activeTab === 'prices' && (
            <div className="p-6 h-full">
              {/* Current Listed Price */}
              <div className="mb-6 p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl border border-teal-200">
                <p className="text-xs text-teal-600 uppercase tracking-wider mb-1">Listed Price Range</p>
                <p className="text-2xl font-display text-teal-800">{metadata.price || 'Price On Request'}</p>
              </div>

              {/* Community Price Aggregates */}
              {quoteSummary && quoteSummary.count > 0 && (
                <div className="mb-6 grid grid-cols-3 gap-3">
                  <div className="bg-stone-50 rounded-xl p-4 text-center">
                    <p className="text-xl font-display text-stone-900">₹{quoteSummary.avg_price?.toLocaleString()}</p>
                    <p className="text-xs text-stone-500 uppercase tracking-wider">Avg /sqft</p>
                  </div>
                  <div className="bg-stone-50 rounded-xl p-4 text-center">
                    <p className="text-xl font-display text-stone-900">₹{quoteSummary.min_price?.toLocaleString()}</p>
                    <p className="text-xs text-stone-500 uppercase tracking-wider">Min /sqft</p>
                  </div>
                  <div className="bg-stone-50 rounded-xl p-4 text-center">
                    <p className="text-xl font-display text-stone-900">₹{quoteSummary.max_price?.toLocaleString()}</p>
                    <p className="text-xs text-stone-500 uppercase tracking-wider">Max /sqft</p>
                  </div>
                </div>
              )}

              {/* Add Your Quote Section */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-stone-900 mb-3 flex items-center gap-2">
                  <span className="text-lg">💰</span>
                  Share Your Quote
                </h3>
                <p className="text-sm text-stone-500 mb-4">Help others by sharing the price you were quoted by the builder.</p>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-stone-500 uppercase tracking-wider mb-2">Price per Sq.Ft (₹) *</label>
                      <input
                        type="number"
                        value={priceQuote}
                        onChange={(e) => setPriceQuote(e.target.value)}
                        placeholder="e.g., 5500"
                        className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-500 uppercase tracking-wider mb-2">Configuration (optional)</label>
                      <input
                        type="text"
                        value={quoteConfig}
                        onChange={(e) => setQuoteConfig(e.target.value)}
                        placeholder="e.g., 3 BHK"
                        className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-stone-900"
                      />
                    </div>
                  </div>
                  <button
                    disabled={quoteSubmitting}
                    onClick={async () => {
                      const price = parseInt(priceQuote, 10);
                      if (!price || price <= 0) return;
                      setQuoteSubmitting(true);
                      try {
                        await submitQuote(slug, price, quoteConfig || undefined);
                        setPriceQuote('');
                        setQuoteConfig('');
                        await loadQuotes();
                      } catch { /* ignore */ }
                      setQuoteSubmitting(false);
                    }}
                    className="px-6 py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
                  >
                    {quoteSubmitting ? 'Submitting...' : 'Submit Quote'}
                  </button>
                </div>
              </div>

              {/* Existing Quotes */}
              <div>
                <h3 className="text-xs text-stone-400 uppercase tracking-wider mb-4">
                  Community Quotes {quoteSummary ? `(${quoteSummary.count})` : ''}
                </h3>
                {quotesLoading ? (
                  <p className="text-sm text-stone-400 text-center py-8">Loading...</p>
                ) : quoteSummary && quoteSummary.quotes.length > 0 ? (
                  <div className="space-y-3">
                    {quoteSummary.quotes.map((q) => (
                      <div key={q.id} className={`p-3 rounded-lg border ${q.is_mine ? 'border-teal-200 bg-teal-50' : 'border-stone-200 bg-stone-50'}`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-lg font-semibold text-stone-900">₹{q.price_per_sqft.toLocaleString()}/sqft</span>
                            {q.configuration && <span className="ml-2 text-sm text-stone-500">({q.configuration})</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            {q.is_mine && <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">You</span>}
                            <span className="text-xs text-stone-400">{new Date(q.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-32 bg-stone-50 rounded-xl border border-dashed border-stone-300 flex items-center justify-center">
                    <p className="text-sm text-stone-400">No quotes yet — be the first to contribute!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === 'reviews' && (
            <div className="p-6 h-full">
              {/* Average rating header */}
              {reviewSummary && reviewSummary.count > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200 flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-display text-amber-700">{reviewSummary.avg_rating?.toFixed(1)}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg key={s} className={`w-4 h-4 ${s <= Math.round(reviewSummary.avg_rating ?? 0) ? 'text-amber-400' : 'text-stone-300'}`} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-amber-700">{reviewSummary.count} review{reviewSummary.count !== 1 ? 's' : ''}</p>
                </div>
              )}

              {/* Write a Review Section */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-stone-900 mb-3 flex items-center gap-2">
                  <span className="text-lg">✍️</span>
                  {reviewSummary?.reviews.some(r => r.is_mine) ? 'Update Your Review' : 'Write a Review'}
                </h3>
                
                {/* Star Rating */}
                <div className="mb-4">
                  <label className="block text-xs text-stone-500 uppercase tracking-wider mb-2">Your Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <svg
                          className={`w-8 h-8 ${star <= reviewRating ? 'text-amber-400' : 'text-stone-300'}`}
                          fill={star <= reviewRating ? 'currentColor' : 'none'}
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <div className="mb-4">
                  <label className="block text-xs text-stone-500 uppercase tracking-wider mb-2">Your Review</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience with this project..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-stone-900 resize-none"
                  />
                </div>

                <button
                  disabled={reviewSubmitting}
                  onClick={async () => {
                    if (!reviewText || reviewRating <= 0) return;
                    setReviewSubmitting(true);
                    try {
                      await submitReview(slug, reviewRating, reviewText);
                      await loadReviews();
                    } catch { /* ignore */ }
                    setReviewSubmitting(false);
                  }}
                  className="px-6 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                  {reviewSubmitting ? 'Submitting...' : reviewSummary?.reviews.some(r => r.is_mine) ? 'Update Review' : 'Submit Review'}
                </button>
              </div>

              {/* Existing Reviews */}
              <div>
                <h3 className="text-xs text-stone-400 uppercase tracking-wider mb-4">Community Reviews</h3>
                {reviewsLoading ? (
                  <p className="text-sm text-stone-400 text-center py-8">Loading...</p>
                ) : reviewSummary && reviewSummary.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviewSummary.reviews.map((r) => (
                      <div key={r.id} className={`p-4 rounded-lg border ${r.is_mine ? 'border-teal-200 bg-teal-50' : 'border-stone-200 bg-stone-50'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <svg key={s} className={`w-4 h-4 ${s <= r.rating ? 'text-amber-400' : 'text-stone-300'}`} fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                              </svg>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            {r.is_mine && <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">You</span>}
                            <span className="text-xs text-stone-400">{new Date(r.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <p className="text-sm text-stone-700">{r.review_text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-32 bg-stone-50 rounded-xl border border-dashed border-stone-300 flex items-center justify-center">
                    <p className="text-sm text-stone-400">No reviews yet — be the first to review!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GALLERY TAB */}
          {activeTab === 'gallery' && (
            <div className="p-6 h-full">
              {/* Upload Section */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-stone-900 mb-3 flex items-center gap-2">
                  <span className="text-lg">📸</span>
                  Share Site Visit Photos
                </h3>
                <p className="text-sm text-stone-500 mb-4">Visited this project? Help others by sharing real photos.</p>
                
                <div className="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center hover:border-teal-400 transition-colors cursor-pointer">
                  <svg className="w-12 h-12 text-stone-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="text-sm text-stone-600 mb-1">Click to upload photos</p>
                  <p className="text-xs text-stone-400">PNG, JPG up to 10MB (Coming soon)</p>
                </div>
              </div>

              {/* User Photos Placeholder */}
              <div>
                <h3 className="text-xs text-stone-400 uppercase tracking-wider mb-4">Community Photos</h3>
                <div className="h-48 bg-stone-50 rounded-xl border border-dashed border-stone-300 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-stone-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <p className="text-sm text-stone-400">No user photos yet</p>
                    <p className="text-xs text-stone-400 mt-1">Be the first to share!</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MY NOTES TAB */}
          {activeTab === 'notes' && (
            <div className="p-6 h-full">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-stone-900 mb-1 flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  My Personal Notes
                </h3>
                <p className="text-sm text-stone-500">Keep private notes about this property. Only visible to you.</p>
              </div>

              {noteLoading ? (
                <p className="text-sm text-stone-400 text-center py-8">Loading...</p>
              ) : (
                <>
                  <textarea
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    placeholder="Write your notes here... 

• What did you like about this project?
• Questions to ask the builder
• Pros and cons from site visit
• Payment terms discussed
• Contact person details"
                    rows={12}
                    className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-stone-900 resize-none"
                  />

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-stone-400">
                      <span className="inline-flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        Private — only visible to you
                        {noteSavedAt && <span className="ml-2">· Last saved {new Date(noteSavedAt).toLocaleString()}</span>}
                      </span>
                    </p>
                    <button
                      disabled={noteSaving}
                      onClick={async () => {
                        if (!userNote.trim()) return;
                        setNoteSaving(true);
                        try {
                          const saved = await saveNote(slug, userNote);
                          setNoteSavedAt(saved.updated_at);
                        } catch { /* ignore */ }
                        setNoteSaving(false);
                      }}
                      className="px-6 py-2.5 bg-stone-800 text-white rounded-lg font-medium hover:bg-stone-900 transition-colors disabled:opacity-50"
                    >
                      {noteSaving ? 'Saving...' : 'Save Note'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PropertyModal;
