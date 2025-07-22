import { apiClient, ApiResponse } from './api'
import { User, CivicPost } from '../types'

export interface UpdateUserRequest {
  username?: string
  display_name?: string
  bio?: string
  avatar_url?: string
  cover_photo?: string
}

export interface UserPostsResponse {
  posts: CivicPost[]
  page: number
  size: number
  total: number
}

// Simple cache for user data
let userCache: User | null = null
let userCacheExpiry: number = 0
const CACHE_DURATION = 1 * 1000 // 10 seconds for development

export const userService = {
  async getCurrentUser(): Promise<User> {
    // Check cache first
    if (userCache && Date.now() < userCacheExpiry) {
      return userCache
    }
    
    const user = await apiClient.get<User>('/users/profile')
    
    // Update cache
    userCache = user
    userCacheExpiry = Date.now() + CACHE_DURATION
    
    return user
  },

  async getCurrentUserPosts(page: number = 1, size: number = 10): Promise<UserPostsResponse> {
    const response = await apiClient.get<ApiResponse<UserPostsResponse>>(`/users/posts?page=${page}&size=${size}`)
    if (!response.data) {
      throw new Error('Failed to get user posts')
    }
    return response.data
  },

  async updateProfile(userData: UpdateUserRequest): Promise<User> {
    const user = await apiClient.put<User>('/users/profile', userData)
    
    // Update cache
    userCache = user
    userCacheExpiry = Date.now() + CACHE_DURATION
    
    return user
  },

  // Clear cache when user logs out
  clearCache(): void {
    userCache = null
    userCacheExpiry = 0
  },

  async uploadAvatar(file: File): Promise<{ avatar_url: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:8000'}/api/v1/users/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload avatar')
    }

    const result = await response.json()
    return result.data || result
  },

  async uploadCoverPhoto(file: File): Promise<{ cover_photo_url: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:8000'}/api/v1/users/cover-photo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload cover photo')
    }

    const result = await response.json()
    return result.data || result
  }
}
