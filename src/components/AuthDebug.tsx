import React, { useState } from 'react'
import { useUser } from '../contexts/UserContext'
import { authManager } from '../services/authManager'
import { User } from 'lucide-react'

export default function AuthDebug() {
  const { user, loading, login, logout } = useUser()
  const [debugInfo, setDebugInfo] = useState('')

  const refreshDebugInfo = () => {
    const token = authManager.getAccessToken()
    const refreshToken = authManager.getRefreshToken()
    const storedUser = authManager.getStoredUser()
    const isAuth = authManager.isAuthenticated()
    const shouldRefresh = authManager.shouldRefreshToken()

    // Add detailed token info
    let tokenInfo = 'None'
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const exp = new Date(payload.exp * 1000)
        tokenInfo = `Present (expires: ${exp.toLocaleTimeString()})`
      } catch (e) {
        tokenInfo = 'Present (invalid format)'
      }
    }

    const info = `
=== AUTH DEBUG INFO ===
Current User: ${user ? `${user.username} (${user.id})` : 'None'}
Loading: ${loading}
Access Token: ${tokenInfo}
Refresh Token: ${refreshToken ? 'Present' : 'None'}
Stored User: ${storedUser ? `${storedUser.username} (${storedUser.id})` : 'None'}
Is Authenticated: ${isAuth}
Should Refresh Token: ${shouldRefresh}
User Match: ${user && storedUser ? (user.id === storedUser.id ? 'Yes' : 'No') : 'N/A'}
===========================
    `.trim()

    setDebugInfo(info)
  }

  const handleTestLogin = async () => {
    try {
      console.log('🧪 Testing login...')
      await login('test@example.com', 'Password123!')
      refreshDebugInfo()
    } catch (error) {
      console.error('Test login failed:', error)
      alert('Test login failed: ' + (error as Error).message)
    }
  }

  const handleTestLogout = async () => {
    try {
      console.log('🧪 Testing logout...')
      await logout()
      refreshDebugInfo()
    } catch (error) {
      console.error('Test logout failed:', error)
    }
  }

  const handleRefreshToken = async () => {
    try {
      console.log('🧪 Testing token refresh...')
      const newToken = await authManager.refreshAccessToken()
      console.log('New token:', newToken ? 'Success' : 'Failed')
      refreshDebugInfo()
    } catch (error) {
      console.error('Token refresh failed:', error)
    }
  }

  React.useEffect(() => {
    refreshDebugInfo()
  }, [user, loading])

  if (!import.meta.env?.DEV) {
    return null // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center gap-2 mb-3">
        <User className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-sm">Auth Debug</h3>
      </div>
      
      <div className="space-y-2 mb-3">
        <button
          onClick={handleTestLogin}
          className="w-full px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        >
          Test Login
        </button>
        <button
          onClick={handleTestLogout}
          className="w-full px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
        >
          Test Logout
        </button>
        <button
          onClick={handleRefreshToken}
          className="w-full px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
        >
          Refresh Token
        </button>
        <button
          onClick={refreshDebugInfo}
          className="w-full px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
        >
          Refresh Info
        </button>
      </div>

      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-64 whitespace-pre-wrap">
        {debugInfo}
      </pre>
    </div>
  )
}
