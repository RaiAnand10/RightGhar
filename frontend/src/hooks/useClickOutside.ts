import { useEffect, RefObject } from 'react'

/**
 * Hook that detects clicks outside of the specified element
 * @param ref - React ref to the element to detect outside clicks for
 * @param handler - Callback function to execute when click outside is detected
 * @param enabled - Optional flag to enable/disable the hook (default: true)
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [ref, handler, enabled])
}

/**
 * Hook that detects clicks outside of multiple elements (using a ref map)
 * @param refs - Object mapping keys to React refs
 * @param activeKey - The currently active key to check for outside clicks
 * @param handler - Callback function to execute when click outside is detected
 */
export function useClickOutsideMultiple<T extends HTMLElement>(
  refs: { [key: string]: RefObject<T> | T | null },
  activeKey: string | null,
  handler: () => void
) {
  useEffect(() => {
    if (!activeKey) return

    const handleClickOutside = (event: MouseEvent) => {
      const activeRef = refs[activeKey]
      if (!activeRef) return

      const element = 'current' in activeRef ? activeRef.current : activeRef
      if (element && !element.contains(event.target as Node)) {
        handler()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [refs, activeKey, handler])
}
