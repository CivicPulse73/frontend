import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { CivicPost, User } from '../types'
import { postsService, PostFilters, CreatePostRequest } from '../services/posts'

interface PostContextType {
  posts: CivicPost[]
  loading: boolean
  error: string | null
  filters: PostFilters
  hasMore: boolean
  addPost: (post: CreatePostRequest) => Promise<void>
  addNewsFromAPI: (newsData: Omit<CivicPost, 'id' | 'created_at' | 'upvotes' | 'downvotes' | 'comment_count' | 'is_upvoted' | 'is_downvoted' | 'is_saved' | 'post_type'>) => void
  toggleUpvote: (postId: string) => Promise<void>
  toggleDownvote: (postId: string) => Promise<void>
  toggleSave: (postId: string) => Promise<void>
  addComment: (postId: string, content: string, user: User) => void
  loadPosts: (filters?: PostFilters, reset?: boolean) => Promise<void>
  loadMore: () => Promise<void>
  refreshPosts: () => Promise<void>
}

const PostContext = createContext<PostContextType | undefined>(undefined)

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<CivicPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<PostFilters>({})
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadPosts({}, true)
  }, [])

  const loadPosts = async (newFilters?: PostFilters, reset = false) => {
    try {
      setLoading(true)
      setError(null)      
      const filtersToUse = newFilters || filters
      const page = reset ? 1 : currentPage
      
      // Use real API only - no fallback data
      const response = await postsService.getPosts({
        ...filtersToUse,
        page,
        size: 20
      })
      
      if (reset) {
        setPosts(response.items)
        setCurrentPage(1)
      } else {
        setPosts(prev => [...prev, ...response.items])
      }

      setHasMore(response.has_more)
      setCurrentPage(page + 1)

      if (newFilters) {
        setFilters(newFilters)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts')
      console.error('Failed to load posts:', err)
      
      // No fallback data - show error state
      if (reset) {
        setPosts([])
        setHasMore(false)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    if (!hasMore || loading) return
    await loadPosts(filters, false)
  }

  const refreshPosts = async () => {
    await loadPosts(filters, true)
  }

  const addPost = async (postData: CreatePostRequest) => {
    try {
      setLoading(true)
      setError(null)
      
      const newPost = await postsService.createPost(postData)
      setPosts(prev => [newPost, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post')
      console.error('Failed to create post:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const addNewsFromAPI = (newsData: Omit<CivicPost, 'id' | 'created_at' | 'upvotes' | 'downvotes' | 'comment_count' | 'is_upvoted' | 'is_downvoted' | 'is_saved' | 'post_type'>) => {
    const newsPost: CivicPost = {
      ...newsData,
      post_type: 'news', // Force type to be news
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      comment_count: 0,
      view_count: 0,
      share_count: 0,
      priority_score: 0,
      user_id: newsData.author.id,
      is_upvoted: false,
      is_downvoted: false,
      is_saved: false
    }
    setPosts(prev => [newsPost, ...prev])
  }

  const toggleUpvote = async (postId: string) => {
    try {
      const result = await postsService.upvotePost(postId)
      
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            upvotes: result.upvotes,
            downvotes: result.downvotes,
            is_upvoted: result.is_upvoted,
            is_downvoted: result.is_downvoted
          }
        }
        return post
      }))
    } catch (err) {
      console.error('Failed to upvote post:', err)
      throw err
    }
  }

  const toggleDownvote = async (postId: string) => {
    try {
      const result = await postsService.downvotePost(postId)
      
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            upvotes: result.upvotes,
            downvotes: result.downvotes,
            is_upvoted: result.is_upvoted,
            is_downvoted: result.is_downvoted
          }
        }
        return post
      }))
    } catch (err) {
      console.error('Failed to downvote post:', err)
      throw err
    }
  }

  const toggleSave = async (postId: string) => {
    try {
      const result = await postsService.savePost(postId)
      
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, is_saved: result.is_saved } : post
      ))
    } catch (err) {
      console.error('Failed to save post:', err)
      throw err
    }
  }

  const addComment = (postId: string, _content: string, _user: User) => {
    // TODO: Implement real API call to add comment
    // For now, just increment comment count
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, comment_count: post.comment_count + 1 }
        : post
    ))
  }

  return (
    <PostContext.Provider value={{ 
      posts, 
      loading, 
      error, 
      filters, 
      hasMore,
      addPost, 
      addNewsFromAPI, 
      toggleUpvote, 
      toggleDownvote, 
      toggleSave, 
      addComment,
      loadPosts,
      loadMore,
      refreshPosts
    }}>
      {children}
    </PostContext.Provider>
  )
}

export function usePosts() {
  const context = useContext(PostContext)
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostProvider')
  }
  return context
}
