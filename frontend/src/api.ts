const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ProjectListItem {
  id: number;
  slug: string;
  name: string;
  builder_name: string;
  builder_slug: string;
  city_name: string | null;
  locality_name: string | null;
  location_text: string | null;
  configurations: string;
  bhk_options: number[] | null;
  total_units: number | null;
  towers: number | null;
  floors: string | null;
  area_text: string | null;
  area_acres: number | null;
  unit_sizes_text: string | null;
  unit_size_min: number | null;
  unit_size_max: number | null;
  units_per_acre: number | null;
  price_text: string | null;
  price_min_cr: number | null;
  price_max_cr: number | null;
  possession_text: string | null;
  possession_year: number | null;
  rera_number: string | null;
  rera_registered: boolean;
  clubhouse_text: string | null;
  open_space_text: string | null;
  lat: number | null;
  lng: number | null;
  builder_url: string | null;
}

export interface AmenityItem {
  name: string;
  category: string | null;
}

export interface ProjectDetail extends ProjectListItem {
  clubhouse_sqft: number | null;
  open_space_pct: number | null;
  description: string | null;
  standout_features: string | null;
  location_highlights: string | null;
  amenities: AmenityItem[];
}

export async function fetchAllProjects(): Promise<ProjectListItem[]> {
  const response = await fetch(`${API_BASE}/api/v1/projects`, { credentials: 'include' });
  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchProjectDetail(slug: string): Promise<ProjectDetail> {
  const response = await fetch(`${API_BASE}/api/v1/projects/${slug}`, { credentials: 'include' });
  if (!response.ok) {
    throw new Error(`Failed to fetch project: ${response.statusText}`);
  }
  return response.json();
}

// --- Price Quotes ---

export interface PriceQuoteOut {
  id: number;
  price_per_sqft: number;
  configuration: string;
  quoted_date: string;
  is_mine: boolean;
  created_at: string;
}

export interface PriceQuoteSummary {
  quotes: PriceQuoteOut[];
  count: number;
}

export async function fetchQuotes(slug: string): Promise<PriceQuoteSummary> {
  const res = await fetch(`${API_BASE}/api/v1/projects/${slug}/quotes`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch quotes');
  return res.json();
}

export async function submitQuote(
  slug: string,
  price_per_sqft: number,
  configuration: string,
  quoted_date: string,
): Promise<PriceQuoteOut> {
  const res = await fetch(`${API_BASE}/api/v1/projects/${slug}/quotes`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ price_per_sqft, configuration, quoted_date }),
  });
  if (!res.ok) throw new Error('Failed to submit quote');
  return res.json();
}

// --- Reviews ---

export interface ReviewOut {
  id: number;
  rating: number;
  review_text: string;
  is_mine: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewSummary {
  reviews: ReviewOut[];
  count: number;
  avg_rating: number | null;
}

export async function fetchReviews(slug: string): Promise<ReviewSummary> {
  const res = await fetch(`${API_BASE}/api/v1/projects/${slug}/reviews`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
}

export async function submitReview(slug: string, rating: number, review_text: string): Promise<ReviewOut> {
  const res = await fetch(`${API_BASE}/api/v1/projects/${slug}/reviews`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating, review_text }),
  });
  if (!res.ok) throw new Error('Failed to submit review');
  return res.json();
}

// --- Notes ---

export interface NoteOut {
  note_text: string;
  updated_at: string;
  project_slug: string | null;
}

export async function fetchNote(slug: string): Promise<NoteOut | null> {
  const res = await fetch(`${API_BASE}/api/v1/me/notes/${slug}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch note');
  const data = await res.json();
  return data; // null if no note exists
}

export async function saveNote(slug: string, note_text: string): Promise<NoteOut> {
  const res = await fetch(`${API_BASE}/api/v1/me/notes/${slug}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note_text }),
  });
  if (!res.ok) throw new Error('Failed to save note');
  return res.json();
}

// --- Favorites ---

export async function fetchFavorites(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/api/v1/me/favorites`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch favorites');
  return res.json();
}

export async function addFavorite(slug: string): Promise<void> {
  await fetch(`${API_BASE}/api/v1/me/favorites/${slug}`, {
    method: 'PUT',
    credentials: 'include',
  });
}

export async function removeFavorite(slug: string): Promise<void> {
  await fetch(`${API_BASE}/api/v1/me/favorites/${slug}`, {
    method: 'DELETE',
    credentials: 'include',
  });
}
