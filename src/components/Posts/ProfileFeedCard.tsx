import React from 'react'
import FeedCard from '../FeedCard'
import StatusUpdateDropdown from './StatusUpdateDropdown'
import { CivicPost } from '../../types'
import { TicketStatus } from '../UI/TicketStatus'
import { useUser } from '../../contexts/UserContext'

interface ProfileFeedCardProps {
  post: CivicPost
  onStatusUpdate?: (postId: string, newStatus: TicketStatus) => void
  showStatusUpdate?: boolean
}

export default function ProfileFeedCard({ 
  post, 
  onStatusUpdate, 
  showStatusUpdate = false 
}: ProfileFeedCardProps) {
  const { user } = useUser()

  // Determine if user can update status
  const canUpdateStatus = () => {
    if (!user || !showStatusUpdate) return false
    
    // User can update if they are the author of the post
    if (post.author.id === user.id) return true
    
    // User can update if they have a representative account assigned to this post
    if (user.rep_accounts && user.rep_accounts.length > 0 && post.assignee) {
      // Check if any of user's rep accounts match the post's assignee
      return user.rep_accounts.some(repAccount => 
        repAccount.id === post.assignee
      )
    }
    
    return false
  }

  const handleStatusUpdate = (postId: string, newStatus: TicketStatus) => {
    if (onStatusUpdate) {
      onStatusUpdate(postId, newStatus)
    }
  }

  return (
    <div className="relative overflow-visible">
      <FeedCard 
        post={post} 
        customDetailsStatusComponent={
          canUpdateStatus() && post.status ? (
            <StatusUpdateDropdown
              post={post}
              onStatusUpdate={handleStatusUpdate}
              size="sm"
              className="shadow-sm"
              dropdownPosition="left"
            />
          ) : undefined
        }
      />
    </div>
  )
}
