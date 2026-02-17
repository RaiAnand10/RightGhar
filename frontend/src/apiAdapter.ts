/**
 * Adapts API response shapes to the existing frontend Property type.
 * This keeps all existing components working without modification.
 */

import { Property, PropertyMetadata } from './types';
import { ProjectListItem, ProjectDetail } from './api';

/**
 * Convert a listing-level API response to the Property shape used by cards/filters/compare.
 * The `content` field is left empty since it's only needed for the detail modal.
 */
export function apiListItemToProperty(item: ProjectListItem): Property {
  const metadata: PropertyMetadata = {
    id: item.slug,
    project: item.name,
    builder: item.builder_name,
    location: item.location_text || '',
    configuration: item.configurations,
    totalUnits: item.total_units || 0,
    area: item.area_text || 'TBD',
    price: item.price_text || 'On Request',
    possession: item.possession_text || 'TBD',
    rera: item.rera_number || 'TBD',
    towers: item.towers || 0,
    floors: item.floors || '',
    unitSizes: item.unit_sizes_text || '',
    clubhouse: item.clubhouse_text || 'TBD',
    openSpace: item.open_space_text || 'TBD',
    lat: item.lat?.toString() || '',
    lng: item.lng?.toString() || '',
    url: item.builder_url || undefined,
  };

  return {
    metadata,
    content: '', // Not available from listing endpoint — fetched on demand
  };
}

/**
 * Convert a detail API response to the Property shape.
 * Reconstructs the markdown content from the structured detail fields.
 */
export function apiDetailToProperty(detail: ProjectDetail): Property {
  const base = apiListItemToProperty(detail);

  // Reconstruct content markdown from structured fields
  const sections: string[] = [];
  sections.push(`# ${detail.name}`);

  if (detail.description) {
    sections.push(`\n## Overview\n${detail.description}`);
  }

  if (detail.standout_features) {
    sections.push(`\n## Standout Features\n${detail.standout_features}`);
  }

  // Build amenities section from structured amenity list
  if (detail.amenities && detail.amenities.length > 0) {
    const byCategory: Record<string, string[]> = {};
    for (const a of detail.amenities) {
      const cat = a.category || 'general';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(a.name);
    }
    let amenitiesSection = '\n## Amenities';
    for (const [cat, items] of Object.entries(byCategory)) {
      const catTitle = cat.charAt(0).toUpperCase() + cat.slice(1);
      amenitiesSection += `\n### ${catTitle}`;
      for (const item of items) {
        amenitiesSection += `\n- ${item}`;
      }
    }
    sections.push(amenitiesSection);
  }

  if (detail.location_highlights) {
    sections.push(`\n## Location Highlights\n${detail.location_highlights}`);
  }

  base.content = sections.join('\n');
  return base;
}
