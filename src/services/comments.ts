import { apiClient, ApiResponse, PaginatedResponse } from './api'
import { Comment } from '../types'

export interface CreateCommentRequest {
  content: string
  post_id: string
  parent_id?: string // For replies to comments
}

export interface UpdateCommentRequest {
  content: string
}

// Vote request interface to match backend
export interface VoteRequest {
  vote_type: 'upvote' | 'downvote'
}

export const commentsService = {
  async getComments(postId: string): Promise<Comment[]> {
    const response = await apiClient.get<ApiResponse<{ comments: any[]; total: number }>>(`/posts/${postId}/comments`)
    
    if (response.success && response.data?.comments) {
      // Map backend response to frontend format
      const mappedComments = response.data.comments.map((comment: any) => ({
        ...comment,
        // Map user_vote enum to boolean fields for backward compatibility
        is_upvoted: comment.user_vote === 'upvote',
        is_downvoted: comment.user_vote === 'downvote'
      }))
      return mappedComments
    }
    throw new Error(response.error || 'Failed to fetch comments')
  },

  // New method using the paginated comments endpoint
  async getCommentsPaginated(postId: string, page: number = 1, size: number = 10, sortBy: string = 'created_at', sortOrder: string = 'desc'): Promise<PaginatedResponse<Comment>> {
    const queryParams = new URLSearchParams({
      post_id: postId,
      page: page.toString(),
      size: size.toString(),
      sort_by: sortBy,
      sort_order: sortOrder
    })
    
    console.log(`Fetching comments for post ${postId} with params:`, { page, size, sortBy, sortOrder })
    
    const response = await apiClient.get<PaginatedResponse<Comment>>(`/comments?${queryParams}`)
    
    console.log('Comments fetched successfully:', response)
    
    return response
  },

  async createComment(commentData: CreateCommentRequest): Promise<Comment> {
    // Validate required fields before making the API call
    if (!commentData.post_id) {
      throw new Error('post_id is required to create a comment')
    }
    if (!commentData.content || !commentData.content.trim()) {
      throw new Error('content is required to create a comment')
    }

    console.log('Creating comment with data:', commentData)
    
    // Call the new API endpoint directly - it returns the comment object, not wrapped in ApiResponse
    const comment = await apiClient.post<Comment>('/comments', commentData)
    
    console.log('Comment created successfully:', comment)
    
    // Return the comment as-is since it already matches our interface
    return comment
  },

  async updateComment(commentId: string, commentData: UpdateCommentRequest): Promise<Comment> {
    const comment = await apiClient.put<Comment>(`/comments/${commentId}`, commentData)
    
    // Return the comment as-is since it already matches our interface
    return comment
  },

  async deleteComment(commentId: string): Promise<void> {
    // New API returns 204 No Content on successful deletion
    await apiClient.delete(`/comments/${commentId}`)
  },

  async voteOnComment(commentId: string, voteType: 'upvote' | 'downvote'): Promise<void> {
    await apiClient.post(`/comments/${commentId}/vote`, { vote_type: voteType })
  },

  async removeVoteFromComment(commentId: string): Promise<void> {
    await apiClient.delete(`/comments/${commentId}/vote`)
  },

  // Backwards compatibility method for upvoting
  async upvoteComment(commentId: string): Promise<void> {
    await this.voteOnComment(commentId, 'upvote')
  },

  // New method for downvoting
  async downvoteComment(commentId: string): Promise<void> {
    await this.voteOnComment(commentId, 'downvote')
  },

  // Method to get comment replies (if needed)
  async getCommentReplies(commentId: string, page: number = 1, size: number = 10): Promise<{ items: Comment[]; total: number; has_more: boolean }> {
    const response = await apiClient.get<{ items: any[]; total: number; has_more: boolean }>(`/comments/${commentId}/replies?page=${page}&size=${size}`)
    
    // Map the response to include boolean vote fields for frontend compatibility
    const mappedItems = response.items.map((comment: any) => ({
      ...comment,
      is_upvoted: comment.user_vote === 'upvote',
      is_downvoted: comment.user_vote === 'downvote'
    }))
    
    return {
      ...response,
      items: mappedItems
    }
  }
}
