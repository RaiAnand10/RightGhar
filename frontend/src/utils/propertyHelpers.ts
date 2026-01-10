import { Property, BHKFilter, PriceRange } from '../types';

/**
 * Extract price value from string (e.g., "₹2.25 CR" -> 2.25)
 * Returns value in crores
 */
export function extractPrice(priceStr: string | undefined): number | null {
  if (!priceStr) return null;

  const match = priceStr.match(/₹?\s*(\d+\.?\d*)\s*(CR|Cr|cr|L|Lakh|lakh)?/i);
  if (!match) return null;

  const value = parseFloat(match[1]);
  const unit = match[2]?.toLowerCase();

  if (unit?.startsWith('cr')) {
    return value; // Already in crores
  } else if (unit?.includes('l')) {
    return value / 100; // Convert lakhs to crores
  }
  return value;
}

/**
 * Extract year from possession string (e.g., "Dec 2025" -> 2025)
 */
export function extractYear(possessionStr: string | undefined): number | null {
  if (!possessionStr) return null;

  const match = possessionStr.match(/\d{4}/);
  return match ? parseInt(match[0]) : null;
}

/**
 * Check if property matches BHK filter using regex
 * Handles formats like "3 BHK", "3BHK", "3 & 4 BHK", "2, 3 & 4 BHK"
 */
export function matchesBHK(property: Property, bhkFilters: Set<BHKFilter>): boolean {
  if (bhkFilters.size === 0) return true;

  const config = property.metadata.configuration?.toLowerCase() || '';

  return Array.from(bhkFilters).some(bhk => {
    // First try exact match like "3 bhk" or "3bhk"
    const exactRegex = new RegExp(`\\b${bhk}\\s*bhk\\b`, 'i');
    if (exactRegex.test(config)) return true;

    // Then check if number appears before "bhk" (handles "3 & 4 BHK" format)
    const bhkIndex = config.indexOf('bhk');
    if (bhkIndex > 0) {
      const beforeBhk = config.substring(0, bhkIndex);
      // Check if the number exists as a standalone number before "bhk"
      const numberRegex = new RegExp(`\\b${bhk}\\b`);
      return numberRegex.test(beforeBhk);
    }

    return false;
  });
}

/**
 * Check if property matches city filter
 */
export function matchesCity(property: Property, cityFilters: Set<string>): boolean {
  if (cityFilters.size === 0) return true;

  const location = property.metadata.location || '';
  return Array.from(cityFilters).some(city => location.includes(city));
}

/**
 * Check if property matches locality filter
 */
export function matchesLocality(property: Property, localityFilters: Set<string>): boolean {
  if (localityFilters.size === 0) return true;

  const location = property.metadata.location || '';
  return Array.from(localityFilters).some(locality => location.includes(locality));
}

/**
 * Check if property matches builder filter
 */
export function matchesBuilder(property: Property, builderFilters: Set<string>): boolean {
  if (builderFilters.size === 0) return true;

  const builder = property.metadata.builder || '';
  return Array.from(builderFilters).some(b =>
    builder.toLowerCase().includes(b.toLowerCase())
  );
}

/**
 * Check if property matches possession year filter
 */
export function matchesPossessionYear(property: Property, yearFilters: Set<string>): boolean {
  if (yearFilters.size === 0) return true;

  const year = extractYear(property.metadata.possession);
  if (!year) return false;

  return yearFilters.has(year.toString());
}

/**
 * Check if property matches price range filter
 */
export function matchesPriceRange(property: Property, rangeFilters: Set<PriceRange>): boolean {
  if (rangeFilters.size === 0) return true;

  const price = extractPrice(property.metadata.price);
  if (!price) return false;

  return Array.from(rangeFilters).some(range => {
    switch (range) {
      case '0.5-1': return price >= 0.5 && price < 1;
      case '1-1.5': return price >= 1 && price < 1.5;
      case '1.5-2': return price >= 1.5 && price < 2;
      case '2-2.5': return price >= 2 && price < 2.5;
      case '2.5-4': return price >= 2.5 && price < 4;
      case '4-6': return price >= 4 && price < 6;
      case '6-10': return price >= 6 && price < 10;
      case '10+': return price >= 10;
      default: return false;
    }
  });
}

/**
 * Filter properties based on all filter criteria
 */
export function filterProperties(
  properties: Property[],
  filters: {
    city: Set<string>;
    locality: Set<string>;
    builder: Set<string>;
    bhk: Set<BHKFilter>;
    possessionYear: Set<string>;
    priceRange: Set<PriceRange>;
  }
): Property[] {
  return properties.filter(property =>
    matchesCity(property, filters.city) &&
    matchesLocality(property, filters.locality) &&
    matchesBuilder(property, filters.builder) &&
    matchesBHK(property, filters.bhk) &&
    matchesPossessionYear(property, filters.possessionYear) &&
    matchesPriceRange(property, filters.priceRange)
  );
}

/**
 * Sort properties by the given sort option
 */
export function sortProperties(
  properties: Property[],
  sortBy: 'default' | 'price-asc' | 'price-desc' | 'possession-asc' | 'possession-desc'
): Property[] {
  if (sortBy === 'default') return properties;

  return [...properties].sort((a, b) => {
    if (sortBy === 'price-asc' || sortBy === 'price-desc') {
      const priceA = extractPrice(a.metadata.price);
      const priceB = extractPrice(b.metadata.price);

      // Put properties without price at the end
      if (priceA === null && priceB === null) return 0;
      if (priceA === null) return 1;
      if (priceB === null) return -1;

      return sortBy === 'price-asc' ? priceA - priceB : priceB - priceA;
    }

    if (sortBy === 'possession-asc' || sortBy === 'possession-desc') {
      const yearA = extractYear(a.metadata.possession);
      const yearB = extractYear(b.metadata.possession);

      // Put properties without date at the end
      if (yearA === null && yearB === null) return 0;
      if (yearA === null) return 1;
      if (yearB === null) return -1;

      return sortBy === 'possession-asc' ? yearA - yearB : yearB - yearA;
    }

    return 0;
  });
}
