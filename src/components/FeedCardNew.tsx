import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CivicPost } from '../types'
import { MapPin, MessageCircle, ArrowUp, ArrowDown, Bookmark, Share, ChevronDown, ExternalLink, MoreHorizontal } from 'lucide-react'
import { motion } from 'framer-motion'
import { usePosts } from '../contexts/PostContext'
import Avatar from './Avatar'
import CommentModal from './CommentModal'
import { Card, Badge, Button } from './UI'

interface FeedCardProps {
  post: CivicPost
}

// Throttle function to prevent rapid API calls
const throttle = (func: Function, delay: number) => {
  let timeoutId: number | null = null
  let lastExecTime = 0
  return (...args: any[]) => {
    const currentTime = Date.now()
    
    if (currentTime - lastExecTime > delay) {
      func.apply(null, args)
      lastExecTime = currentTime
    } else {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = window.setTimeout(() => {
        func.apply(null, args)
        lastExecTime = Date.now()
      }, delay - (currentTime - lastExecTime))
    }
  }
}

export default function FeedCardNew({ post }: FeedCardProps) {
  const navigate = useNavigate()
  const { toggleUpvote, toggleDownvote, toggleSave } = usePosts()
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Throttled versions of the action functions
  const throttledUpvote = useRef(throttle(() => toggleUpvote(post.id), 1000))
  const throttledDownvote = useRef(throttle(() => toggleDownvote(post.id), 1000))
  const throttledSave = useRef(throttle(() => toggleSave(post.id), 1000))

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'news':
        return 'primary'
      case 'announcement':
        return 'info'
      case 'issue':
        return 'danger'
      case 'accomplishment':
        return 'success'
      default:
        return 'default'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'warning'
      case 'in_progress':
        return 'info'
      case 'resolved':
        return 'success'
      case 'closed':
        return 'danger'
      default:
        return 'default'
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <Card variant="elevated" padding="lg" interactive>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar
              src={post.author?.avatar_url}
              alt={post.author?.username || 'User'}
              size="md"
              className="ring-2 ring-white shadow-md"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-gray-900">
                  {post.author?.display_name || post.author?.username || 'Anonymous'}
                </h4>
                {post.author?.verified && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{post.author?.role_name || 'Citizen'}</span>
                <span>•</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                {post.area && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{post.area}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <button className="icon-btn">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
            {post.title}
          </h3>
          
          <div className="flex items-center space-x-2 mb-3">
            <Badge variant={getPostTypeColor(post.post_type)} size="sm">
              {post.post_type}
            </Badge>
            {post.status && (
              <Badge 
                variant={getStatusColor(post.status)} 
                size="sm"
              >
                {post.status}
              </Badge>
            )}
          </div>

          <p className={`text-gray-700 leading-relaxed ${
            !isExpanded && post.content.length > 200 ? 'line-clamp-3' : ''
          }`}>
            {post.content}
          </p>
          
          {post.content.length > 200 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary-600 text-sm font-medium mt-2 hover:text-primary-700 transition-colors"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Media */}
        {(post.image || post.url_to_image) && (
          <div className="relative overflow-hidden rounded-2xl mb-4 group">
            {imageLoading && (
              <div className="skeleton w-full h-64 bg-gray-200 animate-pulse rounded-2xl"></div>
            )}
            <motion.img
              src={post.image || post.url_to_image}
              alt={post.title}
              className={`w-full h-64 object-cover rounded-2xl transition-all duration-300 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              } group-hover:scale-105`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true)
                setImageLoading(false)
              }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            />
            {post.external_url && (
              <div className="absolute bottom-3 left-3">
                <motion.a
                  href={post.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 bg-black/70 hover:bg-black/80 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>View Source</span>
                </motion.a>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            {/* Upvote */}
            <motion.button
              onClick={() => throttledUpvote.current()}
              className={`icon-btn ${
                post.user_vote === 'upvote' ? 'text-green-600 bg-green-50' : ''
              }`}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowUp className="w-4 h-4" />
              <span className="text-xs font-medium ml-1">{post.upvotes || 0}</span>
            </motion.button>

            {/* Downvote */}
            <motion.button
              onClick={() => throttledDownvote.current()}
              className={`icon-btn ${
                post.user_vote === 'downvote' ? 'text-red-600 bg-red-50' : ''
              }`}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowDown className="w-4 h-4" />
              <span className="text-xs font-medium ml-1">{post.downvotes || 0}</span>
            </motion.button>

            {/* Comments */}
            <motion.button
              onClick={() => setShowCommentModal(true)}
              className="icon-btn"
              whileTap={{ scale: 0.9 }}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs font-medium ml-1">{post.comment_count || 0}</span>
            </motion.button>
          </div>

          <div className="flex items-center space-x-1">
            {/* Save */}
            <motion.button
              onClick={() => throttledSave.current()}
              className={`icon-btn ${
                post.is_saved ? 'text-yellow-600 bg-yellow-50' : ''
              }`}
              whileTap={{ scale: 0.9 }}
            >
              <Bookmark className="w-4 h-4" />
            </motion.button>

            {/* Share */}
            <motion.button
              onClick={handleShare}
              className="icon-btn"
              whileTap={{ scale: 0.9 }}
            >
              <Share className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </Card>

      {/* Comment Modal */}
      {showCommentModal && (
        <CommentModal
          post={post}
          isOpen={showCommentModal}
          onClose={() => setShowCommentModal(false)}
        />
      )}
    </motion.div>
  )
}
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
