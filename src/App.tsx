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

function App() {
  return (
    <ErrorBoundary>
      <UserProvider>
        <PostProvider>
          <NotificationProvider>
            <Router>
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
            </Router>
          </NotificationProvider>
        </PostProvider>
      </UserProvider>
    </ErrorBoundary>
  )
}

export default App
