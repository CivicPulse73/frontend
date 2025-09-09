import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, Heart, MessageCircle, Share2, MoreVertical, ThumbsUp, ThumbsDown } from 'lucide-react'
import { CivicPost, Comment } from '../types'
import { useUser } from '../contexts/UserContext'
import { usePosts } from '../contexts/PostContext'
import { commentsService } from '../services/comments'
import { postsService } from '../services/posts'
import Avatar from '../components/Avatar'
import AuthModal from '../components/AuthModal'

export default function CommentsPage() {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<CivicPost | null>(null)
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [loadingPost, setLoadingPost] = useState(true)
  const [postAuthRequired, setPostAuthRequired] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [hiddenComments, setHiddenComments] = useState<Set<string>>(new Set())
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user } = useUser()
  const { addComment } = usePosts()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Debug URL params
  console.log('🔍 CommentsPage rendered with postId:', postId, 'from URL:', window.location.pathname)

  useEffect(() => {
    console.log('📍 CommentsPage useEffect - postId:', postId)
    if (postId) {
      loadPost()
      loadComments()
    } else {
      console.warn('⚠️ No postId found in URL params')
    }
  }, [postId])

  const loadPost = async () => {
    if (!postId) return
    
    setLoadingPost(true)
    setPostAuthRequired(false)
    try {
      const fetchedPost = await postsService.getPost(postId)
      setPost(fetchedPost)
      console.log('✅ Post loaded successfully')
    } catch (error: any) {
      console.log('⚠️ Post loading failed:', error.message)
      
      // Check if it's an authentication error
      if (error.message?.includes('Authentication required') || error.message?.includes('401')) {
        console.log('🔐 Post requires authentication - user needs to log in to view post details')
        setPostAuthRequired(true)
        // Don't set an error state, just leave post as null
        // Comments will still load and user can authenticate via comment form
      } else {
        console.error('❌ Unexpected post loading error:', error)
      }
    } finally {
      setLoadingPost(false)
    }
  }

  const loadComments = async () => {
    if (!postId) return
    
    setLoadingComments(true)
    try {
      const fetchedComments = await commentsService.getComments(postId)
      setComments(fetchedComments)
    } catch (error) {
      setComments([]) // Reset comments array on error
    } finally {
      setLoadingComments(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔥 Comment form submitted!', { user, commentText, isSubmitting, postId, currentURL: window.location.pathname })
    
    // Enhanced validation with better error messages
    if (!postId) {
      console.error('❌ No postId available - URL might be malformed or not loaded yet')
      alert('Error: Post ID not found. Please try refreshing the page.')
      return
    }
    
    if (!user) {
      console.log('❌ User not logged in - opening auth modal')
      setShowAuthModal(true)
      return
    }
    
    if (!commentText.trim()) {
      console.log('❌ Empty comment text')
      return
    }
    
    if (isSubmitting) {
      console.log('❌ Already submitting')
      return
    }

    setIsSubmitting(true)
    const text = commentText.trim()
    setCommentText('')

    try {
      console.log('🚀 Calling addComment...', { postId, text, userDetails: { id: user.id, username: user.username } })
      const newComment = await addComment(postId, text, user as any)
      console.log('✅ Comment added successfully', newComment)
      
      // Refresh comments after adding new one
      await loadComments()
      // Update post comment count
      setPost(prev => prev ? { ...prev, comment_count: prev.comment_count + 1 } : null)
    } catch (error) {
      console.error('❌ Comment submission failed:', error)
      setCommentText(text) // Restore text on error
      alert('Failed to submit comment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReplySubmit = async (parentId: string) => {
    if (!postId) {
      console.error('❌ No postId available for reply')
      return
    }
    
    if (!user) {
      console.log('❌ User not logged in for reply - opening auth modal')
      setShowAuthModal(true)
      return
    }
    
    if (!replyText.trim() || isSubmittingReply) {
      return
    }

    setIsSubmittingReply(true)
    const text = replyText.trim()
    setReplyText('')

    try {
      console.log('🚀 Submitting reply...', { postId, parentId, text })
      const newReply = await addComment(postId, text, user as any, parentId)
      console.log('✅ Reply added successfully', newReply)
      
      // Refresh comments to show new reply
      await loadComments()
      // Close the reply form
      setReplyingTo(null)
      // Expand replies for this comment
      setExpandedReplies(prev => new Set([...prev, parentId]))
    } catch (error) {
      console.error('❌ Reply submission failed:', error)
      setReplyText(text) // Restore text on error
      alert('Failed to submit reply. Please try again.')
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const toggleCommentVisibility = (commentId: string) => {
    setHiddenComments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  const toggleRepliesVisibility = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  const handleReplyClick = (commentId: string) => {
    setReplyingTo(commentId)
    // Focus the reply textarea after a brief delay to ensure it's rendered
    setTimeout(() => {
      replyTextareaRef.current?.focus()
    }, 100)
  }

  const cancelReply = () => {
    setReplyingTo(null)
    setReplyText('')
  }

  // Group comments by parent_id to build threaded structure
  const organizeComments = (comments: Comment[]): Comment[] => {
    const topLevel = comments.filter(comment => !comment.parent_id)
    const replies = comments.filter(comment => comment.parent_id)
    
    // Add replies to their parent comments
    topLevel.forEach(comment => {
      comment.replies = replies.filter(reply => reply.parent_id === comment.id)
    })
    
    return topLevel
  }

  // Component for rendering individual comments
  const CommentItem = ({ comment, level = 0 }: { comment: Comment; level?: number }) => {
    const isHidden = hiddenComments.has(comment.id)
    const hasReplies = comment.replies && comment.replies.length > 0
    const repliesExpanded = expandedReplies.has(comment.id)
    const showingReplyForm = replyingTo === comment.id

    if (isHidden) {
      return (
        <div className={`${level > 0 ? 'ml-10' : ''} px-4 py-2`}>
          <button
            onClick={() => toggleCommentVisibility(comment.id)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            + Comment hidden (click to show)
          </button>
        </div>
      )
    }

    return (
      <div className={`${level > 0 ? 'ml-10' : ''} px-4 py-3 border-l-2 ${level > 0 ? 'border-gray-200' : 'border-transparent'}`}>
        <div className="flex space-x-3">
          {/* Profile Picture */}
          <Avatar
            src={comment.author.avatar_url}
            alt={comment.author.display_name || 'User'}
            size="sm"
            className="flex-shrink-0"
          />
          
          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-semibold text-gray-900">
                {comment.author.display_name || comment.author.username || 'User'}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(comment.created_at)}
              </span>
            </div>
            
            {/* Comment Text */}
            <p className="text-sm text-gray-900 leading-relaxed mb-2">
              {comment.content}
            </p>
            
            {/* Comment Actions */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleReplyClick(comment.id)}
                className="text-xs text-gray-500 font-medium hover:text-gray-700"
              >
                Reply
              </button>
              <button 
                onClick={() => toggleCommentVisibility(comment.id)}
                className="text-xs text-gray-500 font-medium hover:text-gray-700"
              >
                Hide
              </button>
              {comment.upvotes > 0 && (
                <div className="flex items-center space-x-1">
                  <Heart className="w-3 h-3 text-red-500 fill-current" />
                  <span className="text-xs text-gray-500">{comment.upvotes}</span>
                </div>
              )}
            </div>
            
            {/* Show/Hide Replies Button */}
            {hasReplies && (
              <button 
                onClick={() => toggleRepliesVisibility(comment.id)}
                className="mt-2 text-xs text-gray-500 font-medium hover:text-gray-700"
              >
                {repliesExpanded ? '─── Hide replies' : `─── Show ${comment.replies!.length} ${comment.replies!.length === 1 ? 'reply' : 'replies'}`}
              </button>
            )}

            {/* Reply Form */}
            {showingReplyForm && (
              <div className="mt-3 bg-gray-50 rounded-lg p-3">
                <div className="flex space-x-2 mb-2">
                  <Avatar
                    src={user?.avatar_url}
                    alt={user?.display_name || 'You'}
                    size="xs"
                    className="flex-shrink-0"
                  />
                  <span className="text-sm text-gray-600">
                    Replying to {comment.author.display_name || comment.author.username}
                  </span>
                </div>
                <textarea
                  ref={replyTextareaRef}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleReplySubmit(comment.id)}
                      disabled={!replyText.trim() || isSubmittingReply}
                      className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingReply ? 'Posting...' : 'Reply'}
                    </button>
                    <button
                      onClick={cancelReply}
                      className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Heart Button on Right */}
          <button className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors">
            <Heart className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
          </button>
        </div>

        {/* Replies */}
        {hasReplies && repliesExpanded && (
          <div className="mt-2">
            {comment.replies!.map((reply) => (
              <CommentItem key={reply.id} comment={reply} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentText(e.target.value)
    
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString()
  }

  if (loadingPost) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!post && !loadingPost && postAuthRequired) {
    // Post couldn't be loaded due to authentication requirement
    // But still show comments since they're accessible without auth
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full mr-3"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Comments</h1>
        </div>

        {/* Authentication notice */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mx-4 mt-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Sign in to view full post details.</strong> You can still read and participate in the discussion below.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in now →
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white mx-4 mt-4 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Discussion</h2>
          </div>
          
          {loadingComments ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {organizeComments(comments).map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </div>

        {/* Comment Input - Fixed at bottom */}
        <div className="bg-white border-t border-gray-100 px-4 py-3 relative z-50">
          {user ? (
            <form onSubmit={handleSubmit}>
              <div className="flex items-center space-x-3">
                <Avatar
                  src={user?.avatar_url}
                  alt={user?.display_name || 'You'}
                  size="sm"
                  className="flex-shrink-0"
                />
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={commentText}
                    onChange={handleTextareaChange}
                    placeholder="Add a comment..."
                    className="w-full px-4 py-2 pr-12 border border-gray-200 rounded-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none overflow-hidden min-h-[36px] max-h-20 transition-all duration-200 text-sm bg-gray-50 focus:bg-white"
                    rows={1}
                    style={{ height: 'auto' }}
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || isSubmitting}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full transition-all duration-200 ${
                      commentText.trim() && !isSubmitting
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    aria-label="Send comment"
                  >
                    {isSubmitting ? (
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <button 
                  type="button"
                  className="flex-shrink-0 px-2 py-1 text-xs font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  aria-label="GIF"
                >
                  GIF
                </button>
              </div>
            </form>
          ) : (
            /* Login prompt when user is not authenticated */
            <div className="flex items-center justify-center py-4">
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                <span>Sign in to comment</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Authentication Modal */}
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultMode="login"
        />
      </div>
    )
  }

  if (!post && !loadingPost && !postAuthRequired) {
    // Post not found (non-auth error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Post not found</h2>
          <p className="text-gray-600 mb-4">This post may have been deleted or does not exist.</p>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-700"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  if (!postId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid post URL</h2>
          <p className="text-gray-600 mb-4">The post ID could not be found in the URL.</p>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-900" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Comments</h1>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <MessageCircle className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List - Vertical Scrolling Feed */}
      <div className="flex-1 overflow-y-auto">
        {(post?.comment_count === 0 || comments.length === 0) ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-4"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-2">No comments yet</h3>
            <p className="text-sm text-gray-500">Be the first to share your thoughts!</p>
          </motion.div>
        ) : loadingComments ? (
          <div className="text-center py-16">
            <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-gray-500">Loading comments...</p>
          </div>
        ) : (
          <div className="py-2">
            {organizeComments(comments).map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <CommentItem comment={comment} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Emoji Reactions Row */}
      <div className="bg-white border-t border-gray-100 px-4 py-2 relative z-50">
        <div className="flex items-center justify-center space-x-6">
          <button className="text-xl hover:scale-110 transition-transform">❤️</button>
          <button className="text-xl hover:scale-110 transition-transform">🙌</button>
          <button className="text-xl hover:scale-110 transition-transform">🔥</button>
          <button className="text-xl hover:scale-110 transition-transform">👏</button>
          <button className="text-xl hover:scale-110 transition-transform">😢</button>
          <button className="text-xl hover:scale-110 transition-transform">😍</button>
          <button className="text-xl hover:scale-110 transition-transform">😮</button>
          <button className="text-xl hover:scale-110 transition-transform">😂</button>
        </div>
      </div>

      {/* Comment Input - Fixed at bottom with proper z-index */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 relative z-50">
        {user ? (
          <form onSubmit={handleSubmit}>
            <div className="flex items-center space-x-3">
              <Avatar
                src={user?.avatar_url}
                alt={user?.display_name || 'You'}
                size="sm"
                className="flex-shrink-0"
              />
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={commentText}
                  onChange={handleTextareaChange}
                  placeholder="Add a comment..."
                  className="w-full px-4 py-2 pr-12 border border-gray-200 rounded-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none overflow-hidden min-h-[36px] max-h-20 transition-all duration-200 text-sm bg-gray-50 focus:bg-white"
                rows={1}
                disabled={isSubmitting}
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!commentText.trim() || isSubmitting}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full transition-all duration-200 ${
                  commentText.trim() && !isSubmitting
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                aria-label="Send comment"
              >
                {isSubmitting ? (
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
              </button>
            </div>
            <button 
              type="button"
              className="flex-shrink-0 px-2 py-1 text-xs font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              aria-label="GIF"
            >
              GIF
            </button>
          </div>
        </form>
        ) : (
          /* Login prompt when user is not authenticated */
          <div className="flex items-center justify-center py-4">
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              <span>Sign in to comment</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="login"
      />
    </div>
  )
}
