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
  private retryCount = 0
  private maxRetries = 3

  constructor() {
    // Initialize with stored token if available
    this.initializeFromStorage()
    
    // Add window focus listener to refresh tokens when user returns
    this.addFocusListener()
    
    // Add development debugging
    if (import.meta.env.DEV) {
      console.log('🔧 AuthManager initialized in development mode')
      this.logStoredData()
    }
  }

  private addFocusListener(): void {
    // Refresh tokens when user returns to the tab after being away
    window.addEventListener('focus', async () => {
      if (this.isAuthenticated() && this.shouldRefreshToken()) {
        console.log('👁️ Window focus detected, checking token status...')
        await this.refreshAccessToken()
      }
    })
  }

  private logStoredData(): void {
    if (!import.meta.env.DEV) return
    
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    const user = localStorage.getItem(USER_DATA_KEY)
    
    let tokenInfo = null
    let refreshTokenInfo = null
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const now = Math.floor(Date.now() / 1000)
        tokenInfo = {
          expiresAt: new Date(payload.exp * 1000).toLocaleString(),
          expiresIn: Math.max(0, payload.exp - now),
          isExpired: payload.exp <= now
        }
      } catch (e) {
        tokenInfo = { error: 'Invalid token format' }
      }
    }
    
    if (refreshToken) {
      try {
        const payload = JSON.parse(atob(refreshToken.split('.')[1]))
        const now = Math.floor(Date.now() / 1000)
        refreshTokenInfo = {
          expiresAt: new Date(payload.exp * 1000).toLocaleString(),
          expiresIn: Math.max(0, payload.exp - now),
          isExpired: payload.exp <= now
        }
      } catch (e) {
        refreshTokenInfo = { error: 'Invalid refresh token format' }
      }
    }
    
    console.log('📊 Auth state:', {
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
      hasUser: !!user,
      tokenInfo,
      refreshTokenInfo,
      tokenPreview: token ? `${token.substring(0, 20)}...` : null
    })
  }

  private initializeFromStorage(): void {
    const token = this.getAccessToken()
    if (token) {
      apiClient.setToken(token)
      this.startTokenRefresh()
      
      // Validate token on startup in development
      if (import.meta.env.DEV) {
        this.validateCurrentToken()
      }
    }
  }

  private async validateCurrentToken(): Promise<void> {
    try {
      console.log('🔍 Validating stored token...')
      await apiClient.get('/users/profile')
      console.log('✅ Stored token is valid')
    } catch (error) {
      console.warn('⚠️ Stored token is invalid, clearing auth data:', error)
      this.clearAuthData()
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      if (import.meta.env.DEV) {
        console.log('🔐 Attempting login for:', credentials.email)
      }
      
      const response = await apiClient.post<any>('/auth/login', credentials)
      
      if (response.success && response.data) {
        const authData = response.data as AuthResponse
        
        // Store tokens and user data
        this.storeAuthData(authData)
        this.retryCount = 0 // Reset retry count on successful login
        
        if (import.meta.env.DEV) {
          console.log('✅ Login successful for:', authData.user.username)
        }
        return authData
      }
      
      throw new Error(response.message || 'Login failed')
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('❌ Login failed:', error)
      }
      throw error
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      if (import.meta.env.DEV) {
        console.log('📝 Attempting registration for:', userData.email)
      }
      
      const response = await apiClient.post<any>('/auth/register', userData)
      
      if (response.success && response.data) {
        const authData = response.data as AuthResponse
        
        // Store tokens and user data
        this.storeAuthData(authData)
        
        if (import.meta.env.DEV) {
          console.log('✅ Registration successful for:', authData.user.username)
        }
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

    // Check if refresh token itself is expired
    if (this.isRefreshTokenExpired()) {
      console.log('❌ Refresh token is expired, cannot refresh')
      await this.logout() // Clear all auth data
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
        
        // Reset retry count on success
        this.retryCount = 0
        
        console.log('✅ Token refreshed successfully')
        return tokenData.access_token
      }
      
      throw new Error('Invalid refresh response')
    } catch (error) {
      console.error('❌ Token refresh failed:', error)
      // Don't immediately clear auth data on first failure
      this.retryCount++
      
      if (this.retryCount >= this.maxRetries) {
        console.log('❌ Max refresh retries reached, logging out')
        await this.logout()
        this.retryCount = 0
      }
      
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
    
    // Refresh token every 15 minutes (tokens expire in 120 minutes, refresh 2 hours)
    // This gives us plenty of buffer time
    this.refreshTimer = setInterval(async () => {
      if (this.shouldRefreshToken()) {
        console.log('⏰ Proactive token refresh triggered')
        await this.refreshAccessToken()
      }
    }, 15 * 60 * 1000) // 15 minutes
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
    if (!token) return false
    
    // Check if token is expired
    if (this.isTokenExpired()) {
      console.log('🕐 Token is expired')
      return false
    }
    
    return true
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

  // Check if token is actually expired (not just needs refresh)
  isTokenExpired(): boolean {
    const token = this.getAccessToken()
    if (!token) return true

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Math.floor(Date.now() / 1000)
      const exp = payload.exp
      
      return !exp || exp <= now
    } catch (error) {
      console.warn('⚠️ Failed to check token expiration, treating as expired')
      return true
    }
  }

  // Check if refresh token is expired
  isRefreshTokenExpired(): boolean {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) return true

    try {
      const payload = JSON.parse(atob(refreshToken.split('.')[1]))
      const now = Math.floor(Date.now() / 1000)
      const exp = payload.exp
      
      return !exp || exp <= now
    } catch (error) {
      console.warn('⚠️ Failed to check refresh token expiration, treating as expired')
      return true
    }
  }
}

// Export singleton instance
export const authManager = new AuthManager()
