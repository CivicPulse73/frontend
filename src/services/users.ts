import { apiClient, ApiResponse } from './api'
import { BASE_URL } from '../config/api'
import { User, CivicPost, AccountStatsRequest, AccountStatsResponse, UserStats as LegacyUserStats } from '../types'

export interface UpdateUserRequest {
  username?: string
  display_name?: string
  bio?: string
  avatar_url?: string
  cover_photo?: string
  // Base location fields
  base_latitude?: number
  base_longitude?: number
}

export interface UserPostsResponse {
  posts: CivicPost[]
  page: number
  size: number
  total: number
}

export interface UserStats {
  posts_count: number
  comments_received: number
  upvotes_received: number
  total_views: number
}

// Cache for user data and account stats
let userCache: User | null = null
let userCacheExpiry: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache duration

// Cache for new account stats
let accountStatsCache: Map<string, { stats: AccountStatsResponse['data'], expiry: number }> = new Map()
const STATS_CACHE_DURATION = 2 * 60 * 1000 // 2 minutes cache for stats

export const userService = {
  async getCurrentUser(): Promise<User> {
    console.log('🔍 getCurrentUser: Cache status - userCache:', !!userCache, 'expired:', Date.now() >= userCacheExpiry)
    
    // Check cache first
    if (userCache && Date.now() < userCacheExpiry) {
      console.log('📦 getCurrentUser: Returning cached user data')
      return userCache
    }
    
    // Check localStorage for user data
    const storedUser = localStorage.getItem('current_user')
    const storedExpiry = localStorage.getItem('current_user_expiry')
    console.log('🔍 getCurrentUser: localStorage check - hasUser:', !!storedUser, 'hasExpiry:', !!storedExpiry)
    
    if (storedUser && storedExpiry && Date.now() < parseInt(storedExpiry)) {
      try {
        const userData = JSON.parse(storedUser) as User
        console.log('📦 getCurrentUser: Returning localStorage user data')
        userCache = userData
        userCacheExpiry = parseInt(storedExpiry)
        return userData
      } catch (error) {
        console.warn('Failed to parse stored user data:', error)
        localStorage.removeItem('current_user')
        localStorage.removeItem('current_user_expiry')
      }
    }

    console.log('🌐 getCurrentUser: Fetching fresh data from API')
    const response = await apiClient.get<ApiResponse<User>>('/users/profile')
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get user profile')
    }
    
    const user = response.data
    console.log('🔍 getCurrentUser: API response user data:', user)
    console.log('🔍 getCurrentUser: API response avatar_url:', user.avatar_url)
    
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
    const response = await apiClient.put<ApiResponse<User>>('/users/profile', userData)
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update user profile')
    }
    
    const user = response.data
    
    // Update cache and localStorage
    userCache = user
    userCacheExpiry = Date.now() + CACHE_DURATION
    localStorage.setItem('current_user', JSON.stringify(user))
    localStorage.setItem('current_user_expiry', userCacheExpiry.toString())
    
    return user
  },

  async getUserProfile(id: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`)
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get user profile')
    }
    return response.data
  },



  // NEW: Get account stats with new API structure
  async getAccountStats(request: AccountStatsRequest): Promise<AccountStatsResponse> {
    console.log('📊 getAccountStats called with request:', request)
    
    const cacheKey = `${request.account_ids.join(',')}-${request.representative_account ? 'rep' : 'citizen'}`
    console.log('🔑 Cache key:', cacheKey)
    
    // Check cache first
    const cachedStats = accountStatsCache.get(cacheKey)
    if (cachedStats && Date.now() < cachedStats.expiry) {
      console.log('✅ Returning cached account stats for:', cacheKey)
      return {
        success: true,
        message: 'Account statistics retrieved from cache',
        data: cachedStats.stats,
        errors: null
      }
    }

    console.log('🌐 Making POST request to /accounts/stats')
    console.log('📤 Request payload:', JSON.stringify(request, null, 2))
    
    try {
      const response = await apiClient.post<AccountStatsResponse>('/accounts/stats', request)
      console.log('📥 Raw API response:', response)
      
      if (!response.success || !response.data) {
        console.error('❌ API response indicates failure:', response)
        throw new Error(response.message || 'Failed to get account statistics')
      }

      console.log('✅ Successful API response data:', response.data)
      
      // Cache the result
      accountStatsCache.set(cacheKey, {
        stats: response.data,
        expiry: Date.now() + STATS_CACHE_DURATION
      })
      console.log('💾 Cached stats with key:', cacheKey)

      return response
    } catch (error) {
      console.error('❌ Error in getAccountStats:', error)
      throw error
    }
  },  // Clear cache when user logs out
  clearCache(): void {
    userCache = null
    userCacheExpiry = 0
    accountStatsCache.clear() // Clear account stats cache
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
    
    // Clear cache to force fresh data on next request
    userCache = null
    userCacheExpiry = 0
    localStorage.removeItem('current_user')
    localStorage.removeItem('current_user_expiry')
    
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
    
    // Clear cache to force fresh data on next request
    userCache = null
    userCacheExpiry = 0
    localStorage.removeItem('current_user')
    localStorage.removeItem('current_user_expiry')
    
    // Return the cover_photo_url from the response data
    return { cover_photo_url: result.data?.cover_photo_url || result.cover_photo_url }
  },

  async getUserById(userId: string, includeFollowStatus: boolean = true): Promise<User> {
    const searchParams = new URLSearchParams()
    searchParams.append('include_follow_status', includeFollowStatus.toString())
    
    const response = await apiClient.get<ApiResponse<User>>(`/users/${userId}?${searchParams.toString()}`)
    if (!response.data) {
      throw new Error('User not found')
    }
    return response.data
  }
}
