import { apiClient, ApiResponse, PaginatedResponse } from './api'
import { CivicPost } from '../types'

// Helper function to transform backend post data to frontend format
function transformPost(backendPost: any): CivicPost {
  return {
    ...backendPost,
    // Map user_vote enum to boolean fields for backward compatibility
    is_upvoted: backendPost.user_vote === 'upvote',
    is_downvoted: backendPost.user_vote === 'downvote',
    // Handle media_urls vs images backward compatibility
    images: backendPost.media_urls || backendPost.images,
    // Handle status enum differences
    status: backendPost.status === 'in_progress' ? 'in-progress' : backendPost.status
  }
}

export interface PostFilters {
  page?: number
  size?: number
  post_type?: string
  status?: string
  category?: string
  sort_by?: string
  order?: 'asc' | 'desc'
}

export interface CreatePostRequest {
  title: string
  content: string  // Changed from 'description' to 'content'
  post_type: 'issue' | 'announcement' | 'news' | 'accomplishment' | 'discussion'  // Changed from 'type' to 'post_type'
  area?: string  // Changed from 'area' to optional
  category?: string
  location?: string  // Added location field
  tags?: string[]  // Added tags
  media_urls?: string[]  // Added media_urls
}

export interface UpdatePostRequest {
  title?: string
  content?: string  // Changed from 'description' to 'content'
  post_type?: 'issue' | 'announcement' | 'news' | 'accomplishment' | 'discussion'
  status?: 'open' | 'in_progress' | 'resolved' | 'closed'  // Updated to match backend enum
  area?: string
  category?: string
  location?: string
  tags?: string[]
  media_urls?: string[]
}

export const postsService = {
  async getPosts(filters: PostFilters = {}): Promise<PaginatedResponse<CivicPost>> {
    const searchParams = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    const queryString = searchParams.toString()
    const endpoint = `/posts${queryString ? `?${queryString}` : ''}`
    
    const response = await apiClient.get<PaginatedResponse<any>>(endpoint)
    
    // Transform backend response to frontend format
    return {
      ...response,
      items: response.items.map(transformPost)
    }
  },

  async getPost(postId: string): Promise<CivicPost> {
    const response = await apiClient.get<ApiResponse<{ post: any }>>(`/posts/${postId}`)
    if (response.success && response.data?.post) {
      return transformPost(response.data.post)
    }
    throw new Error(response.error || 'Failed to fetch post')
  },

  async createPost(postData: CreatePostRequest): Promise<CivicPost> {
    const response = await apiClient.post<ApiResponse<{ post: any }>>('/posts', postData)
    if (response.success && response.data?.post) {
      return transformPost(response.data.post)
    }
    throw new Error(response.error || 'Failed to create post')
  },

  async updatePost(postId: string, postData: UpdatePostRequest): Promise<CivicPost> {
    const response = await apiClient.put<ApiResponse<{ post: any }>>(`/posts/${postId}`, postData)
    if (response.success && response.data?.post) {
      return transformPost(response.data.post)
    }
    throw new Error(response.error || 'Failed to update post')
  },

  async deletePost(postId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse>(`/posts/${postId}`)
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete post')
    }
  },

  async upvotePost(postId: string): Promise<{ upvotes: number; downvotes: number; is_upvoted: boolean; is_downvoted: boolean }> {
    const response = await apiClient.post<ApiResponse<any>>(`/posts/${postId}/upvote`)
    if (response.success && response.data) {
      // Map backend response to frontend format
      const data = response.data
      return {
        upvotes: data.upvotes,
        downvotes: data.downvotes,
        is_upvoted: data.user_vote === 'upvote',
        is_downvoted: data.user_vote === 'downvote'
      }
    }
    throw new Error(response.error || 'Failed to upvote post')
  },

  async downvotePost(postId: string): Promise<{ upvotes: number; downvotes: number; is_upvoted: boolean; is_downvoted: boolean }> {
    const response = await apiClient.post<ApiResponse<any>>(`/posts/${postId}/downvote`)
    if (response.success && response.data) {
      // Map backend response to frontend format
      const data = response.data
      return {
        upvotes: data.upvotes,
        downvotes: data.downvotes,
        is_upvoted: data.user_vote === 'upvote',
        is_downvoted: data.user_vote === 'downvote'
      }
    }
    throw new Error(response.error || 'Failed to downvote post')
  },

  async savePost(postId: string): Promise<{ is_saved: boolean }> {
    const response = await apiClient.post<ApiResponse<any>>(`/posts/${postId}/save`)
    if (response.success && response.data) {
      return response.data
    }
    throw new Error(response.error || 'Failed to save post')
  }
}
