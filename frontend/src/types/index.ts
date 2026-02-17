// Centralized TypeScript types for PickYourFlat

// Property types
export interface PropertyMetadata {
  id: string;
  project: string;
  builder: string;
  location: string;
  configuration: string;
  totalUnits: number;
  area: string;
  price: string;
  possession: string;
  rera: string;
  towers: number;
  floors: string;
  unitSizes: string;
  clubhouse: string;
  openSpace: string;
  lat: string;
  lng: string;
  url?: string;
}

export interface Property {
  metadata: PropertyMetadata;
  content: string;
}

// Filter types
export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'possession-asc' | 'possession-desc';
export type BHKFilter = '2' | '3' | '4';
export type PriceRange = '0.5-1' | '1-1.5' | '1.5-2' | '2-2.5' | '2.5-4' | '4-6' | '6-10' | '10+';

export interface FilterState {
  city: Set<string>;
  locality: Set<string>;
  builder: Set<string>;
  bhk: Set<BHKFilter>;
  possessionYear: Set<string>;
  priceRange: Set<PriceRange>;
}

// View types
export type ViewMode = 'grid' | 'map' | 'ai';
