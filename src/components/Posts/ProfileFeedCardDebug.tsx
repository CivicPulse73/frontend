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
    if (!user || !showStatusUpdate) {
      console.log('Debug: No user or showStatusUpdate=false', { user: !!user, showStatusUpdate })
      return false
    }
    
    console.log('Debug: Checking authorization for post:', {
      postId: post.id,
      postTitle: post.title,
      postAuthorId: post.author.id,
      postAssignee: post.assignee,
      userId: user.id,
      userRepAccounts: user.rep_accounts
    })
    
    // User can update if they are the author of the post
    if (post.author.id === user.id) {
      console.log('Debug: User is author - can update')
      return true
    }
    
    // User can update if they have a representative account assigned to this post
    if (user.rep_accounts && user.rep_accounts.length > 0 && post.assignee) {
      console.log('Debug: Checking rep accounts against assignee:', {
        repAccounts: user.rep_accounts.map(rep => rep.id),
        assignee: post.assignee
      })
      
      // Check if any of user's rep accounts match the post's assignee
      const hasMatch = user.rep_accounts.some(repAccount => {
        const match = repAccount.id === post.assignee
        console.log('Debug: Rep account check:', {
          repAccountId: repAccount.id,
          assignee: post.assignee,
          match
        })
        return match
      })
      
      if (hasMatch) {
        console.log('Debug: Rep account matches - can update')
        return true
      }
    }
    
    console.log('Debug: No authorization found - cannot update')
    return false
  }

  const handleStatusUpdate = (postId: string, newStatus: TicketStatus) => {
    if (onStatusUpdate) {
      onStatusUpdate(postId, newStatus)
    }
  }

  const canUpdate = canUpdateStatus()
  console.log('Debug: Final canUpdateStatus result:', canUpdate)

  return (
    <div className="relative">
      <FeedCard post={post} />
      
      {/* Status Update Overlay */}
      {canUpdate && post.status && (
        <div className="absolute top-4 right-4 z-10">
          <StatusUpdateDropdown
            post={post}
            onStatusUpdate={handleStatusUpdate}
            size="sm"
            className="shadow-lg"
          />
        </div>
      )}
      
      {/* Debug overlay */}
      {(import.meta as any).env?.DEV && (
        <div className="absolute bottom-2 left-2 text-xs bg-black text-white p-1 rounded z-20">
          Can Update: {canUpdate ? 'Yes' : 'No'} | Author: {post.author.id === user?.id ? 'Me' : 'Other'} | Assignee: {post.assignee || 'None'}
        </div>
      )}
    </div>
  )
}
