// API configuration and base client
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000'

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  has_more: boolean
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // Initialize token from localStorage
    this.token = localStorage.getItem('access_token')
  }

  setToken(token: string | null) {
    this.token = token
    if (token) {
      localStorage.setItem('access_token', token)
    } else {
      localStorage.removeItem('access_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}/api/v1${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    }

    let lastError: Error | null = null
    const maxRetries = 3
    const retryDelay = 1000

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(url, config)
        
        // If token is expired (401), try to refresh once
        if (response.status === 401 && this.token && !endpoint.includes('/auth/') && attempt === 0) {
          console.log('Token expired, attempting refresh...')
          const newToken = await this.refreshTokenIfAvailable()
          if (newToken) {
            // Update config with new token and retry
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${newToken}`
            }
            continue // Retry with new token
          }
        }
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          // Handle backend APIResponse error format
          const errorMessage = errorData.message || errorData.detail || errorData.error || `HTTP ${response.status}: ${response.statusText}`
          
          // Handle specific error types
          if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After')
            throw new Error(`Rate limit exceeded. Try again in ${retryAfter} seconds.`)
          }
          
          if (response.status >= 500 && attempt < maxRetries - 1) {
            lastError = new Error(`Server error: ${errorMessage}`)
            await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)))
            continue // Retry on server errors
          }
          
          throw new Error(errorMessage)
        }

        return await response.json()
      } catch (error) {
        lastError = error as Error
        
        // Don't retry on client errors (4xx) except 401
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          const statusMatch = error.message.match(/HTTP (\d+)/)
          if (statusMatch && parseInt(statusMatch[1]) !== 401) {
            throw error
          }
        }
        
        // Retry on network errors
        if (attempt < maxRetries - 1) {
          console.log(`Request failed, retrying... (${attempt + 1}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)))
        }
      }
    }
    
    console.error('API Request failed after retries:', lastError)
    throw lastError || new Error('Request failed after multiple attempts')
  }

  private async refreshTokenIfAvailable(): Promise<string | null> {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) return null

    try {
      const response = await fetch(`${this.baseURL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      })

      if (response.ok) {
        const data = await response.json()
        this.setToken(data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        return data.access_token
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
    }

    // If refresh fails, clear tokens
    this.setToken(null)
    localStorage.removeItem('refresh_token')
    return null
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
