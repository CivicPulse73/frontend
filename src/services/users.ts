import { apiClient, ApiResponse } from './api'
import { BASE_URL } from '../config/api'
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
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache duration

export const userService = {
  async getCurrentUser(): Promise<User> {
    // Check cache first
    if (userCache && Date.now() < userCacheExpiry) {
      return userCache
    }
    
    // Check localStorage for user data
    const storedUser = localStorage.getItem('current_user')
    const storedExpiry = localStorage.getItem('current_user_expiry')
    
    if (storedUser && storedExpiry && Date.now() < parseInt(storedExpiry)) {
      try {
        const userData = JSON.parse(storedUser) as User
        userCache = userData
        userCacheExpiry = parseInt(storedExpiry)
        return userData
      } catch (error) {
        console.warn('Failed to parse stored user data:', error)
        localStorage.removeItem('current_user')
        localStorage.removeItem('current_user_expiry')
      }
    }
    
    const response = await apiClient.get<ApiResponse<User>>('/users/profile')
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get user profile')
    }
    
    const user = response.data
    
    // Update cache and localStorage
    userCache = user
    userCacheExpiry = Date.now() + CACHE_DURATION
    localStorage.setItem('current_user', JSON.stringify(user))
    localStorage.setItem('current_user_expiry', userCacheExpiry.toString())
    
    return user
  },

  async getCurrentUserPosts(page: number = 1, size: number = 10): Promise<UserPostsResponse> {
    console.log('🔄 Fetching user posts from API...')
    try {
      const response = await apiClient.get<ApiResponse<UserPostsResponse>>(`/users/posts?page=${page}&size=${size}`)
      console.log('✅ User posts API response:', response)
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to get user posts')
      }
      
      return response.data
    } catch (error) {
      console.error('❌ Get user posts error:', error)
      throw error
    }
  },

  async updateProfile(userData: UpdateUserRequest): Promise<User> {
    const user = await apiClient.put<User>('/users/profile', userData)
    
    // Update cache and localStorage
    userCache = user
    userCacheExpiry = Date.now() + CACHE_DURATION
    localStorage.setItem('current_user', JSON.stringify(user))
    localStorage.setItem('current_user_expiry', userCacheExpiry.toString())
    
    return user
  },

  async getUserById(userId: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${userId}`)
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get user profile')
    }
    
    return response.data
  },

  // Clear cache when user logs out
  clearCache(): void {
    userCache = null
    userCacheExpiry = 0
    localStorage.removeItem('current_user')
    localStorage.removeItem('current_user_expiry')
  },

  async uploadAvatar(file: File): Promise<{ avatar_url: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${BASE_URL}/users/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('civic_access_token')}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to upload avatar')
    }

    const result = await response.json()
    // Return the avatar_url from the response data
    return { avatar_url: result.data?.avatar_url || result.avatar_url }
  },

  async uploadCoverPhoto(file: File): Promise<{ cover_photo_url: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${BASE_URL}/users/cover-photo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('civic_access_token')}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to upload cover photo')
    }

    const result = await response.json()
    // Return the cover_photo_url from the response data
    return { cover_photo_url: result.data?.cover_photo_url || result.cover_photo_url }
  }
}
