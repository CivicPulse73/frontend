import { usePosts } from '../contexts/PostContext'
import FeedCard from '../components/FeedCard'
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react'

export default function Home() {
  const { posts, loading, error, refreshPosts } = usePosts()

  if (loading && posts.length === 0) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading posts...</span>
        </div>
      </div>
    )
  }

  if (error && posts.length === 0) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load posts</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={refreshPosts}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="px-4">
        {/* Error Alert */}
        {error && posts.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-1">
          {posts.map((post) => (
            <FeedCard key={post.id} post={post} />
          ))}
        </div>
        
        {/* Loading More */}
        {loading && posts.length > 0 && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading more posts...</span>
          </div>
        )}
        
        {/* Empty State */}
        {posts.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to CivicPulse!</h3>
            <p className="text-gray-500 mb-6">
              Be the first to share something with your community.
            </p>
            <button
              onClick={() => window.location.href = '/post'}
              className="btn-primary"
            >
              Create Your First Post
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
