import { apiClient, ApiResponse } from './api'

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export interface StatusUpdateRequest {
  status: TicketStatus
}

export interface StatusUpdateResponse {
  post: {
    id: string
    status: TicketStatus
    updated_at: string
    last_activity_at: string
  }
}

export interface StatusHistoryItem {
  id: string
  post_id: string
  old_status: TicketStatus | null
  new_status: TicketStatus
  changed_by: string
  changed_at: string
  note?: string
}

class TicketStatusService {
  /**
   * Update the status of a ticket/post
   * Only authorized users (post author or assigned representative) can update status
   */
  async updateStatus(postId: string, status: TicketStatus): Promise<StatusUpdateResponse> {
    try {
      const response = await apiClient.patch<ApiResponse<StatusUpdateResponse>>(
        `/posts/${postId}/status`,
        { status }
      )
      
      if (response.success && response.data) {
        return response.data
      }
      
      throw new Error(response.error || 'Failed to update ticket status')
    } catch (error) {
      console.error('Status update error:', error)
      throw error
    }
  }

  /**
   * Get status history for a ticket
   */
  async getStatusHistory(postId: string): Promise<StatusHistoryItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<{ history: StatusHistoryItem[] }>>(
        `/posts/${postId}/status-history`
      )
      
      if (response.success && response.data?.history) {
        return response.data.history
      }
      
      return []
    } catch (error) {
      console.error('Failed to fetch status history:', error)
      return []
    }
  }

  /**
   * Check if user can update the status of a specific post
   */
  async canUpdateStatus(postId: string): Promise<boolean> {
    try {
      const response = await apiClient.get<ApiResponse<{ can_update: boolean }>>(
        `/posts/${postId}/can-update-status`
      )
      
      return response.success && response.data?.can_update === true
    } catch (error) {
      console.error('Failed to check status update permission:', error)
      return false
    }
  }

  /**
   * Get allowed status transitions for current status
   */
  getAllowedTransitions(currentStatus: TicketStatus): TicketStatus[] {
    switch (currentStatus) {
      case 'open':
        return ['in_progress', 'closed']
      case 'in_progress':
        return ['resolved', 'open', 'closed']
      case 'resolved':
        return ['closed', 'in_progress']
      case 'closed':
        return ['open']
      default:
        return []
    }
  }

  /**
   * Get status configuration for UI rendering
   */
  getStatusConfig(status: TicketStatus) {
    const configs = {
      open: {
        label: 'Open',
        description: 'Issue reported and awaiting action',
        color: 'red',
        priority: 'high'
      },
      in_progress: {
        label: 'In Progress', 
        description: 'Work is actively being performed',
        color: 'amber',
        priority: 'medium'
      },
      resolved: {
        label: 'Resolved',
        description: 'Issue has been addressed and fixed',
        color: 'green', 
        priority: 'low'
      },
      closed: {
        label: 'Closed',
        description: 'Case is complete and archived',
        color: 'gray',
        priority: 'none'
      }
    }

    return configs[status]
  }

  /**
   * Get status statistics for dashboard
   */
  async getStatusStats(): Promise<Record<TicketStatus, number>> {
    try {
      const response = await apiClient.get<ApiResponse<{ stats: Record<TicketStatus, number> }>>(
        '/posts/status-stats'
      )
      
      if (response.success && response.data?.stats) {
        return response.data.stats
      }
      
      return {
        open: 0,
        in_progress: 0, 
        resolved: 0,
        closed: 0
      }
    } catch (error) {
      console.error('Failed to fetch status statistics:', error)
      return {
        open: 0,
        in_progress: 0,
        resolved: 0, 
        closed: 0
      }
    }
  }

  /**
   * Bulk update multiple ticket statuses (for administrators)
   */
  async bulkUpdateStatus(postIds: string[], status: TicketStatus): Promise<{ success: string[], failed: string[] }> {
    const results = {
      success: [] as string[],
      failed: [] as string[]
    }

    // Process updates in parallel with rate limiting
    const updatePromises = postIds.map(async (postId) => {
      try {
        await this.updateStatus(postId, status)
        results.success.push(postId)
      } catch (error) {
        console.error(`Failed to update status for post ${postId}:`, error)
        results.failed.push(postId)
      }
    })

    await Promise.allSettled(updatePromises)
    return results
  }

  /**
   * Subscribe to real-time status updates (if WebSocket is available)
   */
  subscribeToStatusUpdates(postId: string, callback: (update: StatusUpdateResponse) => void): () => void {
    // This would integrate with your WebSocket/SSE implementation
    // For now, returning a no-op unsubscribe function
    console.log(`Subscribing to status updates for post ${postId}`)
    
    // Example WebSocket implementation:
    // const ws = new WebSocket(`${WS_URL}/posts/${postId}/status-updates`)
    // ws.onmessage = (event) => {
    //   const update = JSON.parse(event.data)
    //   callback(update)
    // }
    
    return () => {
      console.log(`Unsubscribing from status updates for post ${postId}`)
      // ws.close()
    }
  }
}

export const ticketStatusService = new TicketStatusService()
export default ticketStatusService
