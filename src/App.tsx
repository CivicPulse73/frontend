import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout'
import Home from './pages/Home'
import Post from './pages/Post'
import Activity from './pages/Activity'
import Explore from './pages/Explore'
import Profile from './pages/Profile'
import UserProfile from './pages/UserProfile'
import { PostProvider } from './contexts/PostContext'
import { UserProvider } from './contexts/UserContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { ErrorBoundary, NetworkStatus } from './components/ErrorBoundary'
import { roleService } from './services/roleService'
import { useEffect, Suspense } from 'react'
import DevUtils from './utils/devUtils'

// Loading component for Suspense
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}

function App() {
  useEffect(() => {
    // Initialize app with development features
    const initializeApp = async () => {
      try {
        DevUtils.performance('App Initialization', async () => {
          // Preload roles when app initializes for better UX
          await roleService.fetchRoles()
          DevUtils.log('app', 'Roles preloaded successfully')
        })
      } catch (error) {
        // Don't block app loading if roles fail to load
        DevUtils.warn('app', 'Failed to preload roles', error)
      }
    }

    initializeApp()

    // Development-only features
    if (import.meta.env.DEV) {
      // Log app mount
      DevUtils.log('app', 'App component mounted')
      
      // Add global error handler for unhandled promise rejections
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        DevUtils.error('app', 'Unhandled promise rejection', event.reason)
      }
      
      window.addEventListener('unhandledrejection', handleUnhandledRejection)
      
      return () => {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      }
    }
    
    // Return undefined for non-dev environments
    return undefined
  }, [])

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Enhanced error logging for development
        if (import.meta.env.DEV) {
          DevUtils.error('app', 'React Error Boundary caught error', { error, errorInfo })
        } else {
          // In production, you would send to error tracking service
          console.error('App Error:', error, errorInfo)
        }
      }}
    >
      <UserProvider>
        <PostProvider>
          <NotificationProvider>
            <Router>
              <Suspense fallback={<LoadingSpinner />}>
                <AnimatePresence mode="wait">
                  <Layout>
                    <NetworkStatus />
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/post" element={<Post />} />
                      <Route path="/activity" element={<Activity />} />
                      <Route path="/explore" element={<Explore />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/profile/:userId" element={<UserProfile />} />
                    </Routes>
                  </Layout>
                </AnimatePresence>
              </Suspense>
            </Router>
          </NotificationProvider>
        </PostProvider>
      </UserProvider>
    </ErrorBoundary>
  )
}

export default App
