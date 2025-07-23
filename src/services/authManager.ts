import { apiClient } from './api'

// Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  username: string
  display_name?: string
  bio?: string
  avatar_url?: string
  role?: string | null
}

export interface User {
  id: string
  email: string
  username: string
  display_name: string
  bio?: string
  avatar_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
  role?: any
}

export interface AuthResponse {
  user: User
  tokens: {
    access_token: string
    refresh_token: string
    token_type: string
  }
}

// Constants
const ACCESS_TOKEN_KEY = 'civic_access_token'
const REFRESH_TOKEN_KEY = 'civic_refresh_token'
const USER_DATA_KEY = 'civic_user_data'

class AuthManager {
  private refreshTimer: number | null = null

  constructor() {
    // Initialize with stored token if available
    this.initializeFromStorage()
  }

  private initializeFromStorage(): void {
    const token = this.getAccessToken()
    if (token) {
      apiClient.setToken(token)
      this.startTokenRefresh()
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 Attempting login for:', credentials.email)
      
      const response = await apiClient.post<any>('/auth/login', credentials)
      
      if (response.success && response.data) {
        const authData = response.data as AuthResponse
        
        // Store tokens and user data
        this.storeAuthData(authData)
        
        console.log('✅ Login successful for:', authData.user.username)
        return authData
      }
      
      throw new Error(response.message || 'Login failed')
    } catch (error) {
      console.error('❌ Login failed:', error)
      throw error
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('📝 Attempting registration for:', userData.email)
      
      const response = await apiClient.post<any>('/auth/register', userData)
      
      if (response.success && response.data) {
        const authData = response.data as AuthResponse
        
        // Store tokens and user data
        this.storeAuthData(authData)
        
        console.log('✅ Registration successful for:', authData.user.username)
        return authData
      }
      
      throw new Error(response.message || 'Registration failed')
    } catch (error) {
      console.error('❌ Registration failed:', error)
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken()
      
      if (refreshToken) {
        // Notify server about logout
        await apiClient.post('/auth/logout', { refresh_token: refreshToken })
      }
    } catch (error) {
      console.warn('⚠️ Logout API call failed:', error)
    } finally {
      // Clear all auth data regardless of API response
      this.clearAuthData()
      console.log('🚪 Logout completed')
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken()
    
    if (!refreshToken) {
      console.log('❌ No refresh token available')
      return null
    }

    try {
      console.log('🔄 Refreshing access token...')
      
      const response = await apiClient.post<any>('/auth/refresh', {
        refresh_token: refreshToken
      })

      if (response.success && response.data) {
        const tokenData = response.data
        
        // Update stored tokens
        localStorage.setItem(ACCESS_TOKEN_KEY, tokenData.access_token)
        localStorage.setItem(REFRESH_TOKEN_KEY, tokenData.refresh_token)
        
        // Update API client
        apiClient.setToken(tokenData.access_token)
        
        console.log('✅ Token refreshed successfully')
        return tokenData.access_token
      }
      
      throw new Error('Invalid refresh response')
    } catch (error) {
      console.error('❌ Token refresh failed:', error)
      this.clearAuthData()
      return null
    }
  }

  private storeAuthData(authData: AuthResponse): void {
    const { tokens, user } = authData
    
    // Store tokens
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token)
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token)
    
    // Store user data
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user))
    
    // Update API client
    apiClient.setToken(tokens.access_token)
    
    // Start token refresh timer
    this.startTokenRefresh()
    
    // Notify other tabs
    this.notifyAuthChange('login', user)
  }

  private clearAuthData(): void {
    // Clear storage
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_DATA_KEY)
    
    // Clear API client
    apiClient.setToken(null)
    
    // Stop refresh timer
    this.stopTokenRefresh()
    
    // Notify other tabs
    this.notifyAuthChange('logout')
  }

  private startTokenRefresh(): void {
    this.stopTokenRefresh()
    
    // Refresh token every 30 minutes (tokens expire in 120 minutes)
    this.refreshTimer = setInterval(() => {
      this.refreshAccessToken()
    }, 30 * 60 * 1000)
  }

  private stopTokenRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  private notifyAuthChange(type: 'login' | 'logout', user?: User): void {
    const event = new CustomEvent('auth-state-change', {
      detail: { type, user }
    })
    window.dispatchEvent(event)
  }

  // Public getters
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  getStoredUser(): User | null {
    const userData = localStorage.getItem(USER_DATA_KEY)
    if (userData) {
      try {
        return JSON.parse(userData)
      } catch (error) {
        console.warn('⚠️ Failed to parse stored user data')
        localStorage.removeItem(USER_DATA_KEY)
      }
    }
    return null
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken()
    return !!token
  }

  // Check if token is expired (simple check without JWT parsing)
  shouldRefreshToken(): boolean {
    const token = this.getAccessToken()
    if (!token) return false

    try {
      // Simple JWT expiration check
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Math.floor(Date.now() / 1000)
      const exp = payload.exp
      
      // Refresh if token expires within 10 minutes
      return exp && (exp - now) < 600
    } catch (error) {
      console.warn('⚠️ Failed to check token expiration')
      return false
    }
  }
}

// Export singleton instance
export const authManager = new AuthManager()
