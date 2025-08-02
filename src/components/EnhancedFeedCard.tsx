import React, { useState } from 'react'
import { 
  StatusBadge, 
  StatusSelector, 
  StatusIndicator,
  TicketStatus 
} from './UI/TicketStatus'
import { CivicPost } from '../types'
// import { useAuth } from '../contexts/AuthContext'
import ticketStatusService from '../services/ticketStatus'

interface EnhancedFeedCardProps {
  post: CivicPost
  onStatusUpdate?: (postId: string, newStatus: TicketStatus) => void
  currentUser?: { id: string; role_name: string } // Pass user as prop instead
}

export default function EnhancedFeedCard({ post, onStatusUpdate, currentUser }: EnhancedFeedCardProps) {
  // const { user } = useAuth()
  const user = currentUser
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [showStatusSelector, setShowStatusSelector] = useState(false)
  const [canUpdateStatus, setCanUpdateStatus] = useState(false)

  // Check if user can update status when component mounts
  React.useEffect(() => {
    const checkPermissions = async () => {
      if (user && post.status) {
        const canUpdate = await ticketStatusService.canUpdateStatus(post.id)
        setCanUpdateStatus(canUpdate)
      }
    }
    checkPermissions()
  }, [user, post.id, post.status])

  const handleStatusUpdate = async (newStatus: TicketStatus) => {
    if (!user || isUpdatingStatus) return

    setIsUpdatingStatus(true)
    try {
      await ticketStatusService.updateStatus(post.id, newStatus)
      onStatusUpdate?.(post.id, newStatus)
      setShowStatusSelector(false)
      
      // Show success notification (you can integrate with your notification system)
      console.log(`Status updated to ${newStatus}`)
    } catch (error) {
      console.error('Failed to update status:', error)
      // Show error notification
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'issue': return 'bg-red-100 text-red-700 border-red-200'
      case 'announcement': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'accomplishment': return 'bg-green-100 text-green-700 border-green-200'
      case 'news': return 'bg-purple-100 text-purple-700 border-purple-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={post.author.avatar_url || '/default-avatar.png'}
              alt={post.author.display_name || post.author.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-gray-900">
                  {post.author.display_name || post.author.username}
                </h4>
                {post.author.verified && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {post.author.role_name} • {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {/* Status Display */}
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPostTypeColor(post.post_type)}`}>
              {post.post_type}
            </span>
            
            {/* Enhanced Status Badge */}
            {post.status && post.post_type === 'issue' && (
              <div className="relative">
                <StatusBadge 
                  status={post.status as TicketStatus} 
                  size="sm"
                  className={canUpdateStatus ? 'cursor-pointer hover:scale-105 transition-transform' : ''}
                  onClick={canUpdateStatus ? () => setShowStatusSelector(!showStatusSelector) : undefined}
                />
                
                {/* Status Selector Dropdown */}
                {showStatusSelector && canUpdateStatus && (
                  <div className="absolute top-full right-0 mt-2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-64">
                    <StatusSelector
                      currentStatus={post.status as TicketStatus}
                      onStatusChange={handleStatusUpdate}
                      disabled={isUpdatingStatus}
                    />
                    {isUpdatingStatus && (
                      <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
          {post.title}
        </h3>
        
        <p className="text-gray-700 mb-4 leading-relaxed">
          {post.content}
        </p>

        {/* Media */}
        {(post.image || post.url_to_image) && (
          <div className="relative overflow-hidden rounded-lg mb-4">
            <img
              src={post.image || post.url_to_image}
              alt={post.title}
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {/* Location & Metadata */}
        {post.location && (
          <div className="flex items-center space-x-1 text-sm text-gray-500 mb-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>{post.location}</span>
          </div>
        )}

        {/* Enhanced Status Information for Issues */}
        {post.status && post.post_type === 'issue' && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <StatusIndicator status={post.status as TicketStatus} showLabel />
                <span className="text-sm text-gray-600">
                  Last updated {new Date(post.updated_at).toLocaleDateString()}
                </span>
              </div>
              
              {canUpdateStatus && (
                <button
                  onClick={() => setShowStatusSelector(!showStatusSelector)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  disabled={isUpdatingStatus}
                >
                  Update Status
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span className="text-sm font-medium">{post.upvotes}</span>
            </button>
            
            <button className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-sm font-medium">{post.downvotes}</span>
            </button>
            
            <button className="flex items-center space-x-1 text-gray-600 hover:text-green-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm font-medium">{post.comment_count}</span>
            </button>
          </div>
          
          <button className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
      </div>

      {/* Click outside to close status selector */}
      {showStatusSelector && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowStatusSelector(false)}
        />
      )}
    </div>
  )
}
