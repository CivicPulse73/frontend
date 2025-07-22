import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '../types'
import { authService, LoginRequest, RegisterRequest } from '../services/auth'
import { userService, UpdateUserRequest } from '../services/users'

interface UserContextType {
  user: User | null
  loading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  updateUser: (updates: UpdateUserRequest) => Promise<void>
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Initialize auth service with stored tokens
        authService.initializeAuth()
        
        if (authService.isAuthenticated()) {
          // Only fetch user if we don't already have one
          if (!user) {
            const currentUser = await userService.getCurrentUser()
            setUser(currentUser)
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
        // Clear invalid tokens
        await authService.logout()
      } finally {
        setLoading(false)
      }
    }

    // Listen for token expiration events
    const handleTokenExpired = () => {
      console.log('Token expired event received, logging out...')
      setUser(null)
      authService.logout()
    }

    window.addEventListener('token-expired', handleTokenExpired)

    // Only initialize if we haven't already
    if (loading) {
      initializeAuth()
    }

    // Cleanup event listener
    return () => {
      window.removeEventListener('token-expired', handleTokenExpired)
    }
  }, [user, loading])

  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true)
      const response = await authService.login(credentials)
      setUser(response.user)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: RegisterRequest) => {
    try {
      setLoading(true)
      const response = await authService.register(userData)
      setUser(response.user)
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      // Clear user cache
      userService.clearCache()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
    }
  }

  const updateUser = async (updates: UpdateUserRequest) => {
    try {
      if (!user) throw new Error('No user logged in')
      
      setLoading(true)
      const updatedUser = await userService.updateProfile(updates)
      setUser(updatedUser)
    } catch (error) {
      console.error('Update user failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      if (!authService.isAuthenticated()) return
      
      setLoading(true)
      const currentUser = await userService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Refresh user failed:', error)
      // Don't throw here as this is typically called automatically
    } finally {
      setLoading(false)
    }
  }

  return (
    <UserContext.Provider value={{ user, loading, login, register, logout, updateUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
