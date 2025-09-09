import { 
  EVoteTrends, 
  EVoteTrendData, 
  RepresentativeEVoteResponse, 
  RepresentativeEVoteStatus,
  RepresentativeEVoteStats
} from '../types'
import { authManager } from './authManager'
import { BASE_URL } from '../config/api'

class EvotesService {
  private baseUrl = BASE_URL

  // Helper method to get auth headers
  private getAuthHeaders(): Record<string, string> {
    const token = authManager.getAccessToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return headers
  }

  async getRepresentativeEvoteTrends(representativeId: string, days: number = 7): Promise<EVoteTrends> {
    try {
      const response = await fetch(`${this.baseUrl}/representatives/${representativeId}/evote-trends?days=${days}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch evote trends: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.warn('Evote trends API not available, using mock data:', error)
      
      // Generate mock data for development
      const mockTrends: EVoteTrendData[] = []
      const now = new Date()
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        
        mockTrends.push({
          date: date.toISOString().split('T')[0],
          total_evotes: Math.floor(Math.random() * 50) + (days - i) * 5
        })
      }
      
      const currentTotal = mockTrends[mockTrends.length - 1]?.total_evotes || 0
      const previousTotal = mockTrends[0]?.total_evotes || 0
      
      return {
        representative_id: representativeId,
        trends: mockTrends,
        current_total: currentTotal,
        period_change: currentTotal - previousTotal,
        period_days: days
      }
    }
  }

  async castEvote(representativeId: string): Promise<RepresentativeEVoteResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/representatives/${representativeId}/evote`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in to vote')
        }
        if (response.status === 400) {
          throw new Error('You have already voted for this representative')
        }
        if (response.status === 404) {
          throw new Error('Representative not found')
        }
        throw new Error(`Failed to cast eVote: ${response.statusText}`)
      }
      
      const data: RepresentativeEVoteResponse = await response.json()
      return data
    } catch (error) {
      console.error('Cast evote error:', error)
      throw error
    }
  }

  async removeEvote(representativeId: string): Promise<RepresentativeEVoteResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/representatives/${representativeId}/evote`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in to remove vote')
        }
        if (response.status === 400) {
          throw new Error('You have not voted for this representative')
        }
        if (response.status === 404) {
          throw new Error('Representative not found')
        }
        throw new Error(`Failed to remove eVote: ${response.statusText}`)
      }
      
      const data: RepresentativeEVoteResponse = await response.json()
      return data
    } catch (error) {
      console.error('Remove evote error:', error)
      throw error
    }
  }

  async checkEvoteStatus(representativeId: string): Promise<RepresentativeEVoteStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/representatives/${representativeId}/evote`, {
        headers: this.getAuthHeaders()
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated, return default state
          return { has_evoted: false }
        }
        if (response.status === 404) {
          throw new Error('Representative not found')
        }
        throw new Error(`Failed to check eVote status: ${response.statusText}`)
      }
      
      const data: RepresentativeEVoteStatus = await response.json()
      return data
    } catch (error) {
      console.error('Check evote status error:', error)
      // Return default state on error
      return { has_evoted: false }
    }
  }

  async getRepresentativeEvoteStats(representativeId: string): Promise<RepresentativeEVoteStats> {
    try {
      const response = await fetch(`${this.baseUrl}/representatives/${representativeId}/evote-stats`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Representative not found')
        }
        throw new Error(`Failed to get eVote stats: ${response.statusText}`)
      }
      
      const data: RepresentativeEVoteStats = await response.json()
      return data
    } catch (error) {
      console.error('Get evote stats error:', error)
      // Return default stats on error
      return {
        representative_id: representativeId,
        total_evotes: 0,
        evote_percentage: 0,
        rank: undefined
      }
    }
  }

  async getTopEvotedRepresentatives(limit: number = 10): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/representatives/evotes/top?limit=${limit}`)
      
      if (!response.ok) {
        throw new Error(`Failed to get top eVoted representatives: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.data.representatives
    } catch (error) {
      console.error('Get top evoted representatives error:', error)
      return []
    }
  }
}

export const evotesService = new EvotesService()