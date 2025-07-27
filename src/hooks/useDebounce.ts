import { useState, useEffect } from 'react'

/**
 * Custom hook for debouncing values
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Custom hook for debounced jurisdiction search
 * @param titleId The selected title ID
 * @param query The search query
 * @param delay The debounce delay in milliseconds
 * @returns Object with debounced query and loading state
 */
export function useDebouncedJurisdictionSearch(
  titleId: string | null,
  query: string,
  delay: number = 300
) {
  const [isSearching, setIsSearching] = useState(false)
  const debouncedQuery = useDebounce(query, delay)

  useEffect(() => {
    if (query !== debouncedQuery) {
      setIsSearching(true)
    } else {
      setIsSearching(false)
    }
  }, [query, debouncedQuery])

  return {
    debouncedQuery,
    isSearching: isSearching && query.length > 0,
    shouldSearch: titleId && debouncedQuery && debouncedQuery.length > 0
  }
}

export default useDebounce
