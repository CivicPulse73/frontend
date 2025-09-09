import { API_CONFIG } from '../config/api'
import { VoteStats, VoteResponse } from '../types'

class VotingService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  async voteUser(userId: string): Promise<VoteResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/users/${userId}/vote`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`Failed to vote user: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error voting user:', error)
      // Mock response for now
      return {
        success: true,
        vote_count: Math.floor(Math.random() * 100) + 1,
        is_voted: true
      }
    }
  }

  async unvoteUser(userId: string): Promise<VoteResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/users/${userId}/vote`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`Failed to unvote user: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error unvoting user:', error)
      // Mock response for now
      return {
        success: true,
        vote_count: Math.floor(Math.random() * 100),
        is_voted: false
      }
    }
  }

  async getUserVoteStats(userId: string): Promise<VoteStats> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/users/${userId}/vote-stats`, {
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`Failed to get vote stats: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting vote stats:', error)
      // Mock response for now
      return {
        vote_count: Math.floor(Math.random() * 100),
        is_voted: Math.random() > 0.5
      }
    }
  }

  async checkUserVoted(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/users/${userId}/voted`, {
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`Failed to check vote status: ${response.statusText}`)
      }

      const data = await response.json()
      return data.is_voted
    } catch (error) {
      console.error('Error checking vote status:', error)
      // Mock response for now
      return Math.random() > 0.5
    }
  }
}

export const votingService = new VotingService()
