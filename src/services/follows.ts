import { apiClient, ApiResponse, PaginatedResponse } from './api'
import { FollowUser, FollowResponse, FollowStatusResponse, FollowStats } from '../types'

// Backend-specific response types to match the actual API
interface BackendFollowResponse {
  success: boolean
  message: string
  mutual: boolean
}

interface BackendUnfollowResponse {
  success: boolean
  message: string
}

interface BackendFollowersResponse {
  followers: FollowUser[]
  total_count: number
  page: number
  size: number
  has_next: boolean
}

interface BackendFollowingResponse {
  following: FollowUser[]
  total_count: number
  page: number
  size: number
  has_next: boolean
}

interface BackendFollowStatsResponse {
  followers_count: number
  following_count: number
  mutual_follows_count: number
}

export const followService = {
  /**
   * Follow a user
   */
  async followUser(userId: string): Promise<FollowResponse> {
    const response = await apiClient.post<ApiResponse<BackendFollowResponse>>(`/users/${userId}/follow`)
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to follow user')
    }
    
    // Convert backend response to frontend format
    return {
      success: response.data.success,
      is_following: true,
      mutual: response.data.mutual,
      followers_count: 0, // Not provided by backend
      following_count: 0  // Not provided by backend
    }
  },

  /**
   * Unfollow a user
   */
  async unfollowUser(userId: string): Promise<FollowResponse> {
    const response = await apiClient.delete<ApiResponse<BackendUnfollowResponse>>(`/users/${userId}/unfollow`)
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to unfollow user')
    }
    
    // Convert backend response to frontend format
    return {
      success: response.data.success,
      is_following: false,
      mutual: false,
      followers_count: 0, // Not provided by backend
      following_count: 0  // Not provided by backend
    }
  },

  /**
   * Get a user's followers
   */
  async getFollowers(
    userId: string, 
    page: number = 1, 
    size: number = 20
  ): Promise<PaginatedResponse<FollowUser>> {
    const response = await apiClient.get<ApiResponse<BackendFollowersResponse>>(
      `/users/${userId}/followers?page=${page}&size=${size}`
    )
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get followers')
    }
    
    // Convert backend response to frontend format
    return {
      items: response.data.followers,
      total: response.data.total_count,
      page: response.data.page,
      size: response.data.size,
      has_more: response.data.has_next
    }
  },

  /**
   * Get users that a user is following
   */
  async getFollowing(
    userId: string, 
    page: number = 1, 
    size: number = 20
  ): Promise<PaginatedResponse<FollowUser>> {
    const response = await apiClient.get<ApiResponse<BackendFollowingResponse>>(
      `/users/${userId}/following?page=${page}&size=${size}`
    )
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get following')
    }
    
    // Convert backend response to frontend format
    return {
      items: response.data.following,
      total: response.data.total_count,
      page: response.data.page,
      size: response.data.size,
      has_more: response.data.has_next
    }
  },

  /**
   * Get follow statistics for a user
   */
  async getFollowStats(userId: string): Promise<FollowStats> {
    const response = await apiClient.get<ApiResponse<BackendFollowStatsResponse>>(`/users/${userId}/follow-stats`)
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get follow stats')
    }
    
    // Convert backend response to frontend format
    return {
      followers_count: response.data.followers_count,
      following_count: response.data.following_count
    }
  },

  /**
   * Check if current user is following another user
   */
  async getFollowStatus(userId: string): Promise<FollowStatusResponse> {
    const response = await apiClient.get<ApiResponse<FollowStatusResponse>>(`/users/${userId}/follow-status`)
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get follow status')
    }
    
    return response.data
  }
}
