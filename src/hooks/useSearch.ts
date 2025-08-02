import { useState, useCallback } from 'react'
import { searchService, SearchResult, SearchResponse } from '../services/search'

export interface UseSearchResult {
  results: SearchResult[]
  loading: boolean
  error: string | null
  total: number
  hasMore: boolean
  search: (query: string, filters?: { type?: 'post' | 'user' | 'location' }) => Promise<void>
  clear: () => void
}

export function useSearch(): UseSearchResult {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const search = useCallback(async (
    query: string, 
    filters?: { type?: 'post' | 'user' | 'location' }
  ) => {
    if (!query.trim()) {
      clear()
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response: SearchResponse = await searchService.search(query, filters)
      setResults(response.results)
      setTotal(response.total)
      setHasMore(response.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setResults([])
      setTotal(0)
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = useCallback(() => {
    setResults([])
    setLoading(false)
    setError(null)
    setTotal(0)
    setHasMore(false)
  }, [])

  return {
    results,
    loading,
    error,
    total,
    hasMore,
    search,
    clear
  }
}