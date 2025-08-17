import { apiClient, ApiResponse } from './api'
import { User } from '../types'

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
  role?: string | null // UUID of the role or null for default citizen role
  // Base location fields
  base_latitude?: number
  base_longitude?: number
  base_location?: string
}

export interface AuthResponse {
  user: User
  tokens: {
    access_token: string
    refresh_token: string
    token_type: string
  }
}

class AuthService {
  private tokenRefreshTimer: number | null = null

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials)
    
    if (response.success && response.data) {
      // Store tokens
      apiClient.setToken(response.data.tokens.access_token)
      localStorage.setItem('civic_access_token', response.data.tokens.access_token)
      localStorage.setItem('civic_refresh_token', response.data.tokens.refresh_token)
      
      // Store user data in localStorage for cross-tab access
      localStorage.setItem('civic_current_user', JSON.stringify(response.data.user))
      localStorage.setItem('civic_current_user_expiry', (Date.now() + 5 * 60 * 1000).toString())
      
      // Start token refresh timer
      this.startTokenRefreshTimer()
      
      // Broadcast login event to other tabs
      window.dispatchEvent(new CustomEvent('user-login', { 
        detail: response.data.user 
      }))
      
      return response.data
    }
    

    
    // Use the errors array first, then message field from the backend APIResponse format
    const errorMessage = response.errors?.[0] || response.message || response.error || 'Login failed'
    throw new Error(errorMessage)
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', userData)
    
    if (response.success && response.data) {
      // Store tokens
      apiClient.setToken(response.data.tokens.access_token)
      localStorage.setItem('civic_access_token', response.data.tokens.access_token)
      localStorage.setItem('civic_refresh_token', response.data.tokens.refresh_token)
      
      // Store user data in localStorage for cross-tab access
      localStorage.setItem('civic_current_user', JSON.stringify(response.data.user))
      localStorage.setItem('civic_current_user_expiry', (Date.now() + 5 * 60 * 1000).toString())
      
      // Start token refresh timer
      this.startTokenRefreshTimer()
      
      // Broadcast login event to other tabs
      window.dispatchEvent(new CustomEvent('user-login', { 
        detail: response.data.user 
      }))
      
      return response.data
    }
    
    throw new Error(response.message || response.error || 'Registration failed')
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('civic_refresh_token')
    
    // Stop token refresh timer
    this.stopTokenRefreshTimer()
    
    try {
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refresh_token: refreshToken })
      }
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // Clear tokens regardless of API call success
      apiClient.setToken(null)
      localStorage.removeItem('civic_access_token')
      localStorage.removeItem('civic_refresh_token')
      localStorage.removeItem('civic_current_user')
      localStorage.removeItem('civic_current_user_expiry')
      
      // Broadcast logout event to other tabs
      window.dispatchEvent(new CustomEvent('user-logout'))
    }
  }

  async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('civic_refresh_token')
    
    if (!refreshToken) {
      return null
    }

    try {
      const response = await apiClient.post<{
        access_token: string
        refresh_token: string
        token_type: string
      }>('/auth/refresh', { refresh_token: refreshToken })
      
      apiClient.setToken(response.access_token)
      localStorage.setItem('civic_access_token', response.access_token)
      localStorage.setItem('civic_refresh_token', response.refresh_token)
      return response.access_token
    } catch (error) {
      console.error('Token refresh failed:', error)
      // Clear invalid tokens
      apiClient.setToken(null)
      localStorage.removeItem('civic_access_token')
      localStorage.removeItem('civic_refresh_token')
      this.stopTokenRefreshTimer()
      return null
    }
  }

  getCurrentToken(): string | null {
    return localStorage.getItem('civic_access_token')
  }

  isAuthenticated(): boolean {
    const token = this.getCurrentToken()
    if (token) {
      // Check if token is expired or will expire soon
      if (this.isTokenExpiredOrExpiringSoon(token)) {
        console.log('Token expired or expiring soon, attempting refresh...')
        // Try to refresh token silently
        this.refreshToken().catch(() => {
          console.log('Silent token refresh failed')
        })
      }
      // Ensure the API client has the token
      apiClient.setToken(token)
    }
    return !!token
  }

  // Check if token is expired or will expire within 5 minutes
  isTokenExpiredOrExpiringSoon(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Math.floor(Date.now() / 1000)
      const exp = payload.exp
      // Consider token expired if it expires within 5 minutes (300 seconds)
      return !exp || (exp - now) < 300
    } catch (error) {
      console.error('Error parsing token:', error)
      return true // Treat invalid tokens as expired
    }
  }

  // Initialize auth state from localStorage and start token refresh timer
  initializeAuth(): void {
    const token = this.getCurrentToken()
    if (token) {
      apiClient.setToken(token)
      // Start proactive token refresh
      this.startTokenRefreshTimer()
    }
  }

  // Start a timer to proactively refresh tokens
  startTokenRefreshTimer(): void {
    // Clear any existing timer
    if (this.tokenRefreshTimer) {
      clearInterval(this.tokenRefreshTimer)
    }

    // Check and refresh token every 10 minutes
    this.tokenRefreshTimer = window.setInterval(async () => {
      const token = this.getCurrentToken()
      if (token && this.isTokenExpiredOrExpiringSoon(token)) {
        console.log('Proactively refreshing token...')
        try {
          await this.refreshToken()
          console.log('Token refreshed successfully')
        } catch (error) {
          console.error('Failed to refresh token:', error)
          // If refresh fails, user will be logged out on next API call
        }
      }
    }, 10 * 60 * 1000) // 10 minutes
  }

  // Stop the token refresh timer
  stopTokenRefreshTimer(): void {
    if (this.tokenRefreshTimer) {
      clearInterval(this.tokenRefreshTimer)
      this.tokenRefreshTimer = null
    }
  }
}

export const authService = new AuthService()
