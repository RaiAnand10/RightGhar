import { useMemo } from 'react'
import { usePropertyStore } from '../stores/usePropertyStore'

/**
 * Hook that returns filtered and sorted properties based on current filter state
 * This is a convenience wrapper around the store's getFilteredProperties method
 * that ensures proper memoization for React components
 */
export function useFilteredProperties() {
  const { allProperties, filters, sortBy, getFilteredProperties } = usePropertyStore()

  // Memoize the filtered properties to avoid unnecessary recalculations
  const filteredProperties = useMemo(() => {
    return getFilteredProperties()
  }, [allProperties, filters, sortBy, getFilteredProperties])

  return {
    properties: filteredProperties,
    count: filteredProperties.length,
    hasResults: filteredProperties.length > 0,
  }
}
