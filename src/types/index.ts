export interface Role {
  id: string
  role_name: string
  abbreviation: string
  level_rank: number
  role_type: string
  description: string
  level: string
  is_elected: boolean
  term_length?: number
  status: string
  created_at: string
  updated_at: string
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  district?: string;
  pincode?: string;
}

export interface User {
  id: string
  username: string  // Changed from 'name' to 'username'
  display_name: string  // Added display_name 
  email: string
  avatar_url?: string  // Changed from 'avatar' to 'avatar_url'
  cover_photo?: string
  role?: string  // Now UUID reference to role table
  role_info?: Role  // Full role information when populated
  bio?: string  // Changed from 'area' to 'bio'
  verified?: boolean  // Made optional
  created_at: string
  updated_at: string
}

export interface Author {
  id: string
  username: string
  display_name?: string
  avatar_url?: string
  role_name?: string
  abbreviation?: string
  level_rank?: number
  verified?: boolean  // Added verified field for compatibility
  bio?: string  // Added bio field for compatibility
}

export interface CivicPost {
  id: string
  user_id: string
  author: Author  // Changed to use new Author interface with role fields
  post_type: 'issue' | 'announcement' | 'news' | 'accomplishment' | 'discussion'  // Added 'discussion' type
  title: string
  content: string  // Changed from 'description' to 'content'
  image?: string
  video?: string
  media_urls?: string[]  // Changed from 'images' to 'media_urls' to match backend
  area?: string  // Changed from 'location' to 'area' to match backend
  location?: string  // Keep both for backward compatibility
  latitude?: number  // Geographic coordinates
  longitude?: number  // Geographic coordinates
  created_at: string  // Changed from 'timestamp' to 'created_at'
  updated_at: string  // Added updated_at
  status?: 'open' | 'in_progress' | 'resolved' | 'closed'  // Updated to match backend enum
  category?: string
  upvotes: number
  downvotes: number
  comment_count: number
  view_count: number
  share_count: number
  priority_score: number
  last_activity_at?: string
  user_vote?: 'upvote' | 'downvote' | null  // Changed to match backend enum
  is_upvoted: boolean  // Keep for backward compatibility
  is_downvoted: boolean  // Keep for backward compatibility
  is_saved: boolean
  tags?: string[]  // Added tags array
  source?: 'post' | 'news'  // Added source field to distinguish posts from news
  external_url?: string  // Added for news articles
  source_name?: string  // Added for news source attribution
  // Additional NewsAPI fields for richer news content
  description?: string  // Original news description
  published_at?: string  // Original publish timestamp from news source
  url_to_image?: string  // Direct image URL from news
  news_source_id?: string  // NewsAPI source ID
  author_name?: string  // Original author name from news
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  author: Author  // Changed to use new Author interface with role fields
  content: string
  parent_id?: string
  edited: boolean
  edited_at?: string
  upvotes: number
  downvotes: number
  reply_count: number
  thread_level: number
  thread_path?: string
  created_at: string  // Changed from 'timestamp' to 'created_at'
  updated_at: string
  user_vote?: 'upvote' | 'downvote' | null  // Match backend enum
  replies?: Comment[]
}

export interface Notification {
  id: string
  user_id: string
  post_id?: string
  comment_id?: string
  triggered_by_user_id?: string
  notification_type: 'issue_update' | 'comment' | 'vote' | 'assignment' | 'resolution' | 'mention' | 'follow'  // Match backend enum
  title: string
  message: string
  action_url?: string
  read: boolean
  read_at?: string
  created_at: string  // Changed from 'timestamp' to 'created_at'
}

export interface HighlightStory {
  id: string
  type: 'resolved' | 'alert' | 'event' | 'campaign'
  title: string
  image: string
  content: string
}

export interface Analytics {
  totalIssues: number
  resolvedIssues: number
  averageResolutionTime: number
  topCategories: { name: string; count: number }[]
  areaPerformance: { area: string; rating: number; issuesCount: number }[]
}
