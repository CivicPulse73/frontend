import React from 'react'
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent 
          error={this.state.error!} 
          retry={() => this.setState({ hasError: false, error: null })}
        />
      )
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  const isNetworkError = error.message.includes('fetch') || error.message.includes('network')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {isNetworkError ? (
            <WifiOff className="w-8 h-8 text-red-600" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-red-600" />
          )}
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {isNetworkError ? 'Connection Error' : 'Something went wrong'}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {isNetworkError 
            ? 'Unable to connect to the server. Please check your internet connection and try again.'
            : 'An unexpected error occurred. Please try again.'
          }
        </p>
        
        <button
          onClick={retry}
          className="flex items-center justify-center space-x-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
        
        <div className="mt-4 text-xs text-gray-500">
          Error: {error.message}
        </div>
      </div>
    </div>
  )
}

export function NetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine)

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed top-16 left-0 right-0 bg-red-500 text-white px-4 py-2 text-center text-sm z-40">
      <div className="flex items-center justify-center space-x-2">
        <WifiOff className="w-4 h-4" />
        <span>You're offline. Some features may not work.</span>
      </div>
    </div>
  )
}
