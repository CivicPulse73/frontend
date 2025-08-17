import { apiClient } from './api'

export interface Representative {
  id: string
  jurisdiction_id: string
  title_id: string
  user_id?: string | null
  jurisdiction_name: string
  jurisdiction_level: string
  title_name: string
  abbreviation?: string
  level_rank?: number
  description?: string
  created_at: string
  updated_at: string
}

export interface RepresentativeLinkRequest {
  representative_id: string
}

export interface UserWithRepresentative {
  id: string
  username: string
  email: string
  display_name: string
  bio?: string
  avatar_url?: string
  linked_representative?: Representative
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface RepresentativeFilters {
  page?: number
  limit?: number
  search_query?: string
  title_filter?: string
  jurisdiction_name?: string
  jurisdiction_level?: string
}

export interface PaginatedRepresentativesResponse {
  representatives: Representative[]
  pagination: PaginationInfo
}

export interface RepresentativeSettingsResponse {
  linked_representative?: Representative
  available_representatives: Representative[]
  can_change: boolean
}

export interface Title {
  id: string
  title_name: string
  abbreviation: string
  level: string
  available_count: number
}

export interface Jurisdiction {
  id: string
  name: string
  level: string
  abbreviation?: string
  available_count: number
}

export interface TitleSelectionResponse {
  titles: Title[]
}

export interface JurisdictionSuggestionResponse {
  jurisdictions: Jurisdiction[]
}

export interface RepresentativesBySelectionResponse {
  representatives: Representative[]
}

class RepresentativeService {
  private baseUrl = '/representatives'

  /**
   * Get available (unclaimed) representatives with filtering and pagination
   */
  async getAvailableRepresentatives(filters: RepresentativeFilters = {}): Promise<PaginatedRepresentativesResponse> {
    try {
      const params = new URLSearchParams()
      
      // Add pagination parameters
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      
      // Add filter parameters
      if (filters.search_query) params.append('search_query', filters.search_query)
      if (filters.title_filter) params.append('title_filter', filters.title_filter)
      if (filters.jurisdiction_name) params.append('jurisdiction_name', filters.jurisdiction_name)
      if (filters.jurisdiction_level) params.append('jurisdiction_level', filters.jurisdiction_level)
      
      const queryString = params.toString()
      const url = `${this.baseUrl}/available${queryString ? `?${queryString}` : ''}`
      
      const response = await apiClient.get<any>(url)
      
      if (response.data.success) {
        return {
          representatives: response.data.data.representatives,
          pagination: response.data.data.pagination
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch representatives')
      }
    } catch (error) {
      console.error('Error fetching available representatives:', error)
      throw error
    }
  }

  /**
   * Get all available representatives (legacy method for backward compatibility)
   */
  async getAllAvailableRepresentatives(): Promise<Representative[]> {
    try {
      const result = await this.getAvailableRepresentatives({ limit: 1000 })
      return result.representatives
    } catch (error) {
      console.error('Error fetching all available representatives:', error)
      throw error
    }
  }

  /**
   * Get representatives for user settings with filtering and pagination
   */
  async getRepresentativesForSettings(filters: RepresentativeFilters = {}): Promise<PaginatedRepresentativesResponse> {
    try {
      const params = new URLSearchParams()
      
      // Add pagination parameters
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      
      // Add filter parameters
      if (filters.search_query) params.append('search_query', filters.search_query)
      if (filters.title_filter) params.append('title_filter', filters.title_filter)
      if (filters.jurisdiction_name) params.append('jurisdiction_name', filters.jurisdiction_name)
      if (filters.jurisdiction_level) params.append('jurisdiction_level', filters.jurisdiction_level)
      
      const queryString = params.toString()
      const url = `/users/settings/representative${queryString ? `?${queryString}` : ''}`
      
      const response = await apiClient.get<any>(url)
      
      if (response.data.success) {
        return {
          representatives: response.data.data.representatives,
          pagination: response.data.data.pagination
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch representatives for settings')
      }
    } catch (error) {
      console.error('Error fetching representatives for settings:', error)
      throw error
    }
  }

  /**
   * Get representative by ID
   */
  async getRepresentativeById(id: string): Promise<Representative> {
    try {
      const response = await apiClient.get<any>(`${this.baseUrl}/${id}`)
      
      if (response.success && response.data) {
        return response.data
      }
      
      throw new Error(response.message || 'Representative not found')
    } catch (error) {
      console.error(`Error fetching representative ${id}:`, error)
      throw error
    }
  }

  /**
   * Get the representative linked to a user
   */
  async getUserLinkedRepresentative(userId: string): Promise<Representative | null> {
    try {
      const response = await apiClient.get<any>(`${this.baseUrl}/user/${userId}/linked`)
      
      if (response.success && response.data) {
        return response.data.representative || null
      }
      
      return null
    } catch (error) {
      console.error(`Error fetching linked representative for user ${userId}:`, error)
      return null
    }
  }

  /**
   * Link current user to a representative
   */
  async linkRepresentative(representativeId: string): Promise<{
    user: UserWithRepresentative
    representative: Representative
  }> {
    try {
      const linkRequest: RepresentativeLinkRequest = {
        representative_id: representativeId
      }

      const response = await apiClient.post<any>(`${this.baseUrl}/link`, linkRequest)
      
      if (response.success && response.data) {
        return {
          user: response.data.user,
          representative: response.data.representative
        }
      }
      
      throw new Error(response.message || 'Failed to link representative')
    } catch (error) {
      console.error('Error linking representative:', error)
      throw error
    }
  }

  /**
   * Update current user's linked representative
   */
  async updateRepresentativeLink(representativeId: string): Promise<{
    user: UserWithRepresentative
    representative: Representative
  }> {
    try {
      const linkRequest: RepresentativeLinkRequest = {
        representative_id: representativeId
      }

      const response = await apiClient.put<any>(`${this.baseUrl}/link`, linkRequest)
      
      if (response.success && response.data) {
        return {
          user: response.data.user,
          representative: response.data.representative
        }
      }
      
      throw new Error(response.message || 'Failed to update representative link')
    } catch (error) {
      console.error('Error updating representative link:', error)
      throw error
    }
  }

  /**
   * Unlink current user from their representative
   */
  async unlinkRepresentative(): Promise<UserWithRepresentative> {
    try {
      const response = await apiClient.delete<any>(`${this.baseUrl}/link`)
      
      if (response.success && response.data) {
        return response.data.user
      }
      
      throw new Error(response.message || 'Failed to unlink representative')
    } catch (error) {
      console.error('Error unlinking representative:', error)
      throw error
    }
  }

  /**
   * Get current user's representative settings
   */
  async getRepresentativeSettings(): Promise<RepresentativeSettingsResponse> {
    try {
      const response = await apiClient.get<any>('/users/settings/representative')
      
      if (response.success && response.data) {
        return response.data
      }
      
      throw new Error(response.message || 'Failed to fetch representative settings')
    } catch (error) {
      console.error('Error fetching representative settings:', error)
      throw error
    }
  }

  /**
   * Get available titles for representative linking
   */
  async getAvailableTitles(): Promise<Title[]> {
    try {
      const response = await apiClient.get<any>('/users/settings/representative/titles')
      
      if (response.success && response.data) {
        return response.data.titles
      }
      
      throw new Error(response.message || 'Failed to fetch available titles')
    } catch (error) {
      console.error('Error fetching available titles:', error)
      throw error
    }
  }

  /**
   * Get jurisdiction suggestions based on title and search query (with debouncing)
   */
  async getJurisdictionSuggestions(
    titleId: string, 
    query: string, 
    limit: number = 10
  ): Promise<Jurisdiction[]> {
    try {
      if (!query.trim()) {
        return []
      }

      const params = new URLSearchParams({
        title_id: titleId,
        query: query.trim(),
        limit: limit.toString()
      })

      const response = await apiClient.get<any>(
        `/users/settings/representative/jurisdictions?${params.toString()}`
      )
      
      if (response.success && response.data) {
        return response.data.jurisdictions
      }
      
      throw new Error(response.message || 'Failed to fetch jurisdiction suggestions')
    } catch (error) {
      console.error('Error fetching jurisdiction suggestions:', error)
      throw error
    }
  }

  /**
   * Get representatives for specific title and jurisdiction
   */
  async getRepresentativesBySelection(
    titleId: string, 
    jurisdictionId: string
  ): Promise<Representative[]> {
    try {
      const params = new URLSearchParams({
        title_id: titleId,
        jurisdiction_id: jurisdictionId
      })

      const response = await apiClient.get<any>(
        `/users/settings/representative/by-selection?${params.toString()}`
      )
      
      if (response.success && response.data) {
        return response.data.representatives
      }
      
      throw new Error(response.message || 'Failed to fetch representatives')
    } catch (error) {
      console.error('Error fetching representatives by selection:', error)
      throw error
    }
  }

  /**
   * Format representative display name
   */
  formatRepresentativeName(representative: Representative): string {
    const parts = []
    
    if (representative.abbreviation) {
      parts.push(representative.abbreviation)
    }
    
    parts.push(representative.title_name)
    
    if (representative.jurisdiction_name) {
      parts.push(`- ${representative.jurisdiction_name}`)
    }
    
    return parts.join(' ')
  }

  /**
   * Get jurisdiction level display name
   */
  getJurisdictionLevelName(level: string): string {
    const levelNames: Record<string, string> = {
      'country': 'National',
      'state': 'State',
      'parliamentary_constituency': 'Parliamentary Constituency',
      'district': 'District',
      'assembly_constituency': 'Assembly Constituency',
      'taluk': 'Taluk',
      'village': 'Village'
    }
    
    return levelNames[level] || level
  }
}

export const representativeService = new RepresentativeService()
