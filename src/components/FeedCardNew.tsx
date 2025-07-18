import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CivicPost } from '../types'
import { Calendar, MapPin, MessageCircle, ArrowUp, ArrowDown, Bookmark, Share, ChevronDown, ExternalLink } from 'lucide-react'
import { usePosts } from '../contexts/PostContext'
import Avatar from './Avatar'
import CommentModal from './CommentModal'

interface FeedCardProps {
  post: CivicPost
}

export default function FeedCard({ post }: FeedCardProps) {
  const navigate = useNavigate()
  const { toggleUpvote, toggleDownvote, toggleSave } = usePosts()
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  const handleUserClick = () => {
    navigate(`/profile/${post.author.id}`)
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    return `${Math.floor(diffInSeconds / 86400)}d`
  }

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'issue': return 'bg-red-100 text-red-800 border border-red-200'
      case 'announcement': return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'news': return 'bg-green-100 text-green-800 border border-green-200'
      case 'accomplishment': return 'bg-purple-100 text-purple-800 border border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'in-progress': return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'resolved': return 'bg-green-100 text-green-800 border border-green-200'
      default: return ''
    }
  }

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'issue': return '🚨'
      case 'announcement': return '📢'
      case 'news': return '📰'
      case 'accomplishment': return '🎉'
      default: return '📝'
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.content,
          url: window.location.href
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href)
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  return (
    <div className="feed-card fade-in hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      {/* Header */}
      <div className="p-4 border-b border-gray-50">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar
              src={post.author.avatar_url}
              alt={post.author.display_name}
              size="lg"
              onClick={handleUserClick}
              className="hover:scale-105 transition-transform cursor-pointer"
            />
            <div>
              <div className="flex items-center space-x-2">
                <button onClick={handleUserClick}>
                  <h3 className="font-medium text-gray-900 hover:text-primary-600 transition-colors cursor-pointer">
                    {post.author.display_name}
                  </h3>
                </button>
                {post.author.verified && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center animate-pulse-dot">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
                <span className="text-xs text-gray-500 capitalize px-2 py-1 bg-gray-100 rounded-full">
                  {post.author.role}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                <Calendar className="w-3 h-3" />
                <span>{formatTimeAgo(new Date(post.created_at))}</span>
                <span>•</span>
                <MapPin className="w-3 h-3" />
                <span>{post.location}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPostTypeColor(post.post_type)} flex items-center space-x-1`}>
              <span>{getPostIcon(post.post_type)}</span>
              <span className="capitalize">{post.post_type}</span>
            </span>
            {post.status && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                {post.status.replace('-', ' ')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="font-semibold text-gray-900 mb-2 leading-tight text-lg">
          {post.title}
        </h2>
        <p className="text-gray-700 text-sm leading-relaxed mb-3">
          {post.content}
        </p>
        
        {post.image && !imageError && (
          <div className="relative overflow-hidden rounded-xl mb-3">
            {imageLoading && (
              <div className="skeleton w-full h-48 bg-gray-200 animate-pulse rounded-xl"></div>
            )}
            <img
              src={post.image}
              alt="Post image"
              className={`w-full h-48 object-cover rounded-xl transition-all duration-300 hover:scale-105 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true)
                setImageLoading(false)
              }}
            />
            {post.post_type === 'news' && (
              <div className="absolute top-3 right-3">
                <div className="bg-black bg-opacity-70 text-white px-2 py-1 rounded-lg text-xs flex items-center space-x-1">
                  <ExternalLink className="w-3 h-3" />
                  <span>External</span>
                </div>
              </div>
            )}
          </div>
        )}

        {post.category && (
          <span className="inline-block bg-gradient-primary text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
            #{post.category}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => toggleUpvote(post.id)}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all transform hover:scale-105 active:scale-95 ${
                post.is_upvoted 
                  ? 'bg-green-100 text-green-700 shadow-glow-green' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <ArrowUp className={`w-4 h-4 ${post.is_upvoted ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{post.upvotes}</span>
            </button>
            
            <button
              onClick={() => toggleDownvote(post.id)}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all transform hover:scale-105 active:scale-95 ${
                post.is_downvoted 
                  ? 'bg-red-100 text-red-700 shadow-glow-red' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <ArrowDown className={`w-4 h-4 ${post.is_downvoted ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{post.downvotes}</span>
            </button>
            
            <button 
              onClick={() => setShowCommentModal(true)}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-all transform hover:scale-105 active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{post.comment_count}</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => toggleSave(post.id)}
              className={`p-2 rounded-lg transition-all transform hover:scale-105 active:scale-95 ${
                post.is_saved 
                  ? 'bg-yellow-100 text-yellow-700' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${post.is_saved ? 'fill-current' : ''}`} />
            </button>
            
            <button 
              onClick={handleShare}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-all transform hover:scale-105 active:scale-95"
            >
              <Share className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Show comment count preview */}
        {post.comment_count > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={() => setShowCommentModal(true)}
              className="w-full text-left hover:bg-gray-50 -mx-2 p-2 rounded-lg transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {post.comment_count} {post.comment_count === 1 ? 'comment' : 'comments'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
              {post.comment_count > 1 && (
                <div className="mt-2 text-xs text-gray-500 flex items-center space-x-1">
                  <span>View all {post.comment_count} comments</span>
                </div>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Comment Modal */}
      <CommentModal
        post={post}
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
      />
    </div>
  )
}
