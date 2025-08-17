import { useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { usePosts } from '../contexts/PostContext'
import FeedCard from '../components/FeedCard'
import { AlertCircle, Loader2, RefreshCw, TrendingUp, Users, Calendar } from 'lucide-react'
import { Card, Skeleton } from '../components/UI'

export default function Home() {
  const { posts, loading, error, refreshPosts, loadPosts, loadMore, hasMore } = usePosts()
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Load posts only when component mounts and if we don't have any posts
  useEffect(() => {
    let isMounted = true
    
    if (posts.length === 0 && !loading) {
      loadPosts({}, true).catch(error => {
        if (isMounted) {
          console.error('Failed to load posts:', error)
        }
      })
    }
    
    return () => {
      isMounted = false
    }
  }, [])

  // Intersection observer for infinite scroll
  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return
    if (observerRef.current) observerRef.current.disconnect()
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMore()
      }
    })
    
    if (node) observerRef.current.observe(node)
  }, [loading, hasMore, loadMore])

  // Loading skeleton component
  const PostSkeleton = () => (
    <Card variant="elevated" padding="lg" className="mb-4">
      <div className="flex items-start space-x-3 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="95%" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="rectangular" width="100%" height={200} className="rounded-2xl" />
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="flex space-x-4">
          <Skeleton variant="rectangular" width={60} height={32} className="rounded-lg" />
          <Skeleton variant="rectangular" width={60} height={32} className="rounded-lg" />
          <Skeleton variant="rectangular" width={60} height={32} className="rounded-lg" />
        </div>
        <div className="flex space-x-2">
          <Skeleton variant="rectangular" width={32} height={32} className="rounded-lg" />
          <Skeleton variant="rectangular" width={32} height={32} className="rounded-lg" />
        </div>
      </div>
    </Card>
  )

  if (loading && posts.length === 0) {
    return (
      <motion.div 
        className="max-w-lg mx-auto px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Welcome Header */}
        <motion.div 
          className="mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="elevated" padding="lg" className="bg-gradient-to-r from-primary-50 to-blue-50 border-primary-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome to CivicPulse</h2>
                <p className="text-gray-600 text-sm">Stay connected with your community</p>
              </div>
              <div className="text-primary-600">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Loading Skeletons */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <PostSkeleton />
            </motion.div>
          ))}
        </div>
      </motion.div>
    )
  }

  if (error && posts.length === 0) {
    return (
      <motion.div 
        className="max-w-lg mx-auto px-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card variant="elevated" padding="lg" className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <AlertCircle className="w-8 h-8 text-red-500" />
          </motion.div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <motion.button
            onClick={refreshPosts}
            className="btn-primary inline-flex items-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </motion.button>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="max-w-lg mx-auto px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Error Alert */}
      {error && posts.length > 0 && (
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card variant="outlined" padding="md" className="bg-red-50 border-red-200">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Posts Feed */}
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {posts.map((post, index) => {
          const isLast = posts.length === index + 1
          
          return (
            <motion.div
              key={post.id}
              ref={isLast ? lastPostElementRef : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <FeedCard post={post} />
            </motion.div>
          )
        })}
      </motion.div>

      {/* Loading More Indicator */}
      {loading && posts.length > 0 && (
        <motion.div 
          className="flex items-center justify-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card variant="outlined" padding="md" className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
            <span className="text-gray-600 text-sm">Loading more posts...</span>
          </Card>
        </motion.div>
      )}

      {/* End of Feed Message */}
      {!hasMore && posts.length > 0 && (
        <motion.div 
          className="text-center py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="outlined" padding="lg" className="bg-gray-50">
            <div className="text-gray-500">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">You're all caught up!</p>
              <p className="text-xs mt-1">Check back later for new posts</p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Empty State */}
      {posts.length === 0 && !loading && !error && (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-gray-50 to-blue-50">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to CivicPulse!</h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Connect with your community and stay informed about local issues and events.
            </p>
            <motion.button
              onClick={() => window.location.href = '/post'}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Create Your First Post
            </motion.button>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
