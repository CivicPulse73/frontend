import { apiClient } from './api'

export interface SearchResult {
  id: string
  type: 'post' | 'user' | 'location'
  title: string
  description: string
  imageUrl?: string
  metadata?: Record<string, any>
  score?: number
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  hasMore: boolean
  searchTime?: number
}

// Backend response structure
interface BackendSearchResponse {
  query: string
  results: {
    posts?: any[]
    users?: any[]
    representatives?: any[]
  }
  pagination: {
    posts?: { total: number, has_more: boolean }
    users?: { total: number, has_more: boolean }
    representatives?: { total: number, has_more: boolean }
  }
  metadata: Record<string, any>
}

// Elasticsearch response structure
interface ElasticsearchResponse {
  query: string
  total_results: number
  search_time_ms: number
  results: {
    posts?: {
      total: number
      items: Array<{
        id: string
        score: number
        source: any
      }>
    }
    users?: {
      total: number
      items: Array<{
        id: string
        score: number
        source: any
      }>
    }
  }
  error?: string
}

export class SearchService {
  private useElasticsearch = true // Toggle to use Elasticsearch vs PostgreSQL

  /**
   * Main search method - uses Elasticsearch for better performance
   */
  async search(query: string, filters?: {
    type?: 'post' | 'user' | 'location'
    limit?: number
    offset?: number
  }): Promise<SearchResponse> {
    // Use Elasticsearch if available, fallback to PostgreSQL
    if (this.useElasticsearch) {
      return this.searchElasticsearch(query, filters)
    } else {
      return this.searchPostgres(query, filters)
    }
  }

  /**
   * Search using Elasticsearch microservice
   */
  async searchElasticsearch(query: string, filters?: {
    type?: 'post' | 'user' | 'location'
    limit?: number
    offset?: number
  }): Promise<SearchResponse> {
    try {
      const params = new URLSearchParams({
        q: query,
        limit: (filters?.limit || 20).toString(),
        offset: (filters?.offset || 0).toString()
      })

      // Convert frontend 'type' to backend entity types
      if (filters?.type) {
        const entityTypeMap = {
          'post': 'posts',
          'user': 'users', 
          'location': 'representatives'
        }
        params.append('entity_types', entityTypeMap[filters.type])
      }

      console.log('Elasticsearch search request:', `/search/elasticsearch?${params}`)
      const response = await apiClient.get(`/search/elasticsearch?${params}`) as ElasticsearchResponse
      
      // If search service is unavailable, fallback to PostgreSQL
      if (response.error) {
        console.warn('Elasticsearch unavailable, falling back to PostgreSQL search')
        return this.searchPostgres(query, filters)
      }
      
      console.log('Elasticsearch search response:', response)
      return this.convertElasticsearchResponse(response)
    } catch (error) {
      console.error('Elasticsearch search failed, falling back:', error)
      // Fallback to PostgreSQL search
      return this.searchPostgres(query, filters)
    }
  }

  /**
   * Search using PostgreSQL (fallback)
   */
  async searchPostgres(query: string, filters?: {
    type?: 'post' | 'user' | 'location'
    limit?: number
    offset?: number
  }): Promise<SearchResponse> {
    try {
      const params = new URLSearchParams({
        q: query,
        limit: (filters?.limit || 20).toString(),
        offset: (filters?.offset || 0).toString()
      })

      // Convert frontend 'type' to backend 'entity_types'
      if (filters?.type) {
        const entityTypeMap = {
          'post': 'posts',
          'user': 'users', 
          'location': 'representatives'
        }
        params.append('entity_types', entityTypeMap[filters.type])
        console.log('Searching for type:', filters.type, '-> entity_types:', entityTypeMap[filters.type])
      } else {
        // For "All" searches, search across all entity types
        params.append('entity_types', 'users,posts,representatives')
        console.log('Searching all entity types: users,posts,representatives')
      }

      console.log('PostgreSQL search request URL:', `/search/?${params}`)
      const response = await apiClient.get(`/search/?${params}`) as BackendSearchResponse
      console.log('PostgreSQL search response:', response)
      return this.convertBackendResponse(response, filters?.type)
    } catch (error) {
      console.error('Search failed:', error)
      // Re-throw the error so the UI can handle it properly
      throw new Error(error instanceof Error ? error.message : 'Failed to perform search. Please try again.')
    }
  }

  /**
   * Convert Elasticsearch response to SearchResponse format
   */
  private convertElasticsearchResponse(esResponse: ElasticsearchResponse): SearchResponse {
    const results: SearchResult[] = []
    let total = esResponse.total_results

    // Convert posts from Elasticsearch
    if (esResponse.results.posts?.items) {
      esResponse.results.posts.items.forEach(item => {
        const post = item.source
        results.push({
          id: String(post.id),
          type: 'post',
          title: post.title || 'Untitled Post',
          description: post.content || '',
          imageUrl: post.media_urls?.[0],
          score: item.score,
          metadata: {
            location: post.location,
            city: post.city,
            state: post.state,
            status: post.status,
            post_type: post.post_type,
            category: post.category,
            tags: post.tags,
            visibility: post.visibility,
            author_username: post.author_username,
            created_at: post.created_at
          }
        })
      })
    }

    // Convert users from Elasticsearch
    if (esResponse.results.users?.items) {
      esResponse.results.users.items.forEach(item => {
        const user = item.source
        results.push({
          id: String(user.id),
          type: 'user',
          title: user.full_name || user.username || 'Unknown User',
          description: user.bio || `User: ${user.username}`,
          imageUrl: user.profile_picture_url,
          score: item.score,
          metadata: {
            username: user.username,
            email: user.email,
            verified: user.is_verified,
            active: user.is_active
          }
        })
      })
    }

    return {
      results,
      total,
      hasMore: false, // Elasticsearch doesn't provide has_more in current implementation
      searchTime: esResponse.search_time_ms
    }
  }

  private convertBackendResponse(backendResponse: BackendSearchResponse, filterType?: 'post' | 'user' | 'location'): SearchResponse {
    const results: SearchResult[] = []
    let total = 0
    let hasMore = false

    // Convert posts
    if (backendResponse.results.posts) {
      backendResponse.results.posts.forEach(post => {
        if (!post.id) {
          console.warn('Post without ID found:', post)
          return
        }
        results.push({
          id: String(post.id), // Ensure ID is always a string
          type: 'post',
          title: post.title || 'Untitled Post',
          description: post.content || post.description || '',
          imageUrl: post.image_url || post.image,
          metadata: {
            location: post.location,
            status: post.status,
            upvotes: post.upvotes,
            created_at: post.created_at
          }
        })
      })
      total += backendResponse.pagination.posts?.total || 0
      hasMore = hasMore || (backendResponse.pagination.posts?.has_more || false)
    }

    // Convert users
    if (backendResponse.results.users) {
      backendResponse.results.users.forEach(user => {
        if (!user.id) {
          console.warn('User without ID found:', user)
          return
        }
        results.push({
          id: String(user.id), // Ensure ID is always a string
          type: 'user',
          title: user.display_name || user.username || 'Unknown User',
          description: user.bio || `User: ${user.username}`,
          imageUrl: user.avatar_url,
          metadata: {
            username: user.username,
            verified: user.is_verified,
            followers: user.followers_count,
            role: user.role_name
          }
        })
      })
      total += backendResponse.pagination.users?.total || 0
      hasMore = hasMore || (backendResponse.pagination.users?.has_more || false)
    }

    // Convert representatives
    if (backendResponse.results.representatives) {
      backendResponse.results.representatives.forEach(rep => {
        if (!rep.id) {
          console.warn('Representative without ID found:', rep)
          return
        }
        results.push({
          id: String(rep.id), // Ensure ID is always a string
          type: 'location',
          title: rep.name || 'Unknown Representative',
          description: `${rep.title || 'Representative'} - ${rep.constituency || 'Unknown Constituency'}`,
          imageUrl: rep.image_url,
          metadata: {
            title: rep.title,
            party: rep.party,
            constituency: rep.constituency,
            verified: rep.is_verified
          }
        })
      })
      total += backendResponse.pagination.representatives?.total || 0
      hasMore = hasMore || (backendResponse.pagination.representatives?.has_more || false)
    }

    return {
      results,
      total,
      hasMore
    }
  }

  private getMockSearchResults(query: string, filters?: { type?: string }): SearchResponse {
    // Mock search results for development
    const mockResults: SearchResult[] = [
      {
        id: '1',
        type: 'post' as const,
        title: 'Road Construction on Main Street',
        description: 'Major road construction project affecting traffic flow on Main Street...',
        imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400',
        metadata: { location: 'Main Street', status: 'in_progress' }
      },
      {
        id: '2',
        type: 'user' as const,
        title: 'John Smith',
        description: 'City Council Member for District 3',
        imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        metadata: { role: 'representative', verified: true }
      },
      {
        id: '3',
        type: 'location' as const,
        title: 'Downtown Park',
        description: 'Community park with playground and walking trails',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        metadata: { type: 'park', amenities: ['playground', 'trails'] }
      }
    ].filter(result => {
      // Filter by type if specified
      if (filters?.type && result.type !== filters.type) return false
      
      // Simple search matching
      const searchTerm = query.toLowerCase()
      return result.title.toLowerCase().includes(searchTerm) ||
             result.description.toLowerCase().includes(searchTerm)
    })

    return {
      results: mockResults,
      total: mockResults.length,
      hasMore: false
    }
  }
}

export const searchService = new SearchService()
