import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authManager, User, LoginRequest, RegisterRequest } from '../services/authManager'

interface UserContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (userData: RegisterData) => Promise<User>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  username: string
  display_name?: string
  bio?: string
  avatar_url?: string
  role?: string | null
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  login: async () => { throw new Error('UserContext not initialized') },
  register: async () => { throw new Error('UserContext not initialized') },
  logout: async () => {},
  refreshUser: async () => {}
})

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize user from storage
  useEffect(() => {
    const initializeUser = () => {
      console.log('🔄 Initializing user from storage...')
      const storedUser = authManager.getStoredUser()
      
      if (storedUser && authManager.isAuthenticated()) {
        console.log('✅ Found stored user:', storedUser.username)
        setUser(storedUser)
      } else {
        console.log('❌ No valid stored user found')
        setUser(null)
      }
      
      setLoading(false)
    }

    initializeUser()
  }, [])

  // Listen for authentication state changes (from auth manager)
  useEffect(() => {
    const handleAuthChange = (event: any) => {
      const { type, user: eventUser } = event.detail
      
      console.log(`🔔 Auth state change: ${type}`)
      
      if (type === 'login' && eventUser) {
        setUser(eventUser)
      } else if (type === 'logout') {
        setUser(null)
      }
    }

    window.addEventListener('auth-state-change', handleAuthChange)
    return () => window.removeEventListener('auth-state-change', handleAuthChange)
  }, [])

  // Auto-refresh token if needed
  useEffect(() => {
    if (user && authManager.shouldRefreshToken()) {
      console.log('🔄 Auto-refreshing token...')
      authManager.refreshAccessToken()
    }
  }, [user])

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setLoading(true)
      console.log('🔐 UserContext: Attempting login...')
      
      const credentials: LoginRequest = { email, password }
      const authData = await authManager.login(credentials)
      
      setUser(authData.user)
      console.log('✅ UserContext: Login successful')
      
      return authData.user
    } catch (error) {
      console.error('❌ UserContext: Login failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: RegisterData): Promise<User> => {
    try {
      setLoading(true)
      console.log('📝 UserContext: Attempting registration...')
      
      const registerData: RegisterRequest = {
        email: userData.email,
        password: userData.password,
        username: userData.username,
        display_name: userData.display_name,
        bio: userData.bio,
        avatar_url: userData.avatar_url,
        role: userData.role
      }
      
      const authData = await authManager.register(registerData)
      
      setUser(authData.user)
      console.log('✅ UserContext: Registration successful')
      
      return authData.user
    } catch (error) {
      console.error('❌ UserContext: Registration failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      console.log('🚪 UserContext: Logging out...')
      await authManager.logout()
      setUser(null)
      console.log('✅ UserContext: Logout successful')
    } catch (error) {
      console.error('❌ UserContext: Logout error:', error)
      // Still clear user state even if logout API fails
      setUser(null)
    }
  }

  const refreshUser = async (): Promise<void> => {
    try {
      console.log('🔄 UserContext: Refreshing user...')
      
      if (authManager.isAuthenticated()) {
        const storedUser = authManager.getStoredUser()
        if (storedUser) {
          setUser(storedUser)
          console.log('✅ UserContext: User refreshed from storage')
        } else {
          // If no stored user but we have token, something is wrong
          await authManager.logout()
          setUser(null)
          console.log('⚠️ UserContext: No stored user, logged out')
        }
      } else {
        setUser(null)
        console.log('❌ UserContext: Not authenticated, cleared user')
      }
    } catch (error) {
      console.error('❌ UserContext: Failed to refresh user:', error)
      setUser(null)
    }
  }

  const value: UserContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}
