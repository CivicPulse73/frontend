/**
 * Hook for simple search suggestions
 * Provides debounced suggestions with loading states
 */

import { useState, useEffect, useCallback } from 'react'
import { searchService, SimpleSuggestionsResponse } from '../services/search'

interface UseSimpleSuggestionsOptions {
  debounceMs?: number
  minQueryLength?: number
  limit?: number
}

interface UseSimpleSuggestionsReturn {
  suggestions: string[]
  isLoading: boolean
  error: string | null
  query: string
  setQuery: (query: string) => void
  clearSuggestions: () => void
}

export const useSimpleSuggestions = (
  options: UseSimpleSuggestionsOptions = {}
): UseSimpleSuggestionsReturn => {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    limit = 10
  } = options

  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounced suggestion fetching
  const fetchSuggestions = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < minQueryLength) {
        setSuggestions([])
        setIsLoading(false)
        setError(null)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await searchService.getSimpleSuggestions(searchQuery, limit)
        setSuggestions(response.suggestions)
      } catch (err) {
        console.error('Failed to fetch suggestions:', err)
        setError('Failed to load suggestions')
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    },
    [minQueryLength, limit]
  )

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(query)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, fetchSuggestions, debounceMs])

  const clearSuggestions = useCallback(() => {
    setSuggestions([])
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    suggestions,
    isLoading,
    error,
    query,
    setQuery,
    clearSuggestions
  }
}
