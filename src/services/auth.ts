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
  role?: 'citizen' | 'representative'
}

export interface AuthResponse {
  user: User
  tokens: {
    access_token: string
    refresh_token: string
    token_type: string
  }
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials)
    
    if (response.success && response.data) {
      // Store tokens
      apiClient.setToken(response.data.tokens.access_token)
      localStorage.setItem('refresh_token', response.data.tokens.refresh_token)
      return response.data
    }
    
    throw new Error(response.error || 'Login failed')
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', userData)
    
    if (response.success && response.data) {
      // Store tokens
      apiClient.setToken(response.data.tokens.access_token)
      localStorage.setItem('refresh_token', response.data.tokens.refresh_token)
      return response.data
    }
    
    throw new Error(response.error || 'Registration failed')
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token')
    
    try {
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refresh_token: refreshToken })
      }
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // Clear tokens regardless of API call success
      apiClient.setToken(null)
      localStorage.removeItem('refresh_token')
    }
  },

  async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('refresh_token')
    
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
      localStorage.setItem('refresh_token', response.refresh_token)
      return response.access_token
    } catch (error) {
      console.error('Token refresh failed:', error)
      // Clear invalid tokens
      apiClient.setToken(null)
      localStorage.removeItem('refresh_token')
      return null
    }
  },

  getCurrentToken(): string | null {
    return localStorage.getItem('access_token')
  },

  isAuthenticated(): boolean {
    const token = this.getCurrentToken()
    if (token) {
      // Ensure the API client has the token
      apiClient.setToken(token)
    }
    return !!token
  },

  // Initialize auth state from localStorage
  initializeAuth(): void {
    const token = this.getCurrentToken()
    if (token) {
      apiClient.setToken(token)
    }
  }
}
