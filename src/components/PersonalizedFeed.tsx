import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, RefreshCw, Loader2, AlertCircle, TrendingUp } from 'lucide-react'
import { getPersonalizedFeed, RecommendationItem } from '../services/recommendations'
import FeedCard from './FeedCard'
import { CivicPost } from '../types'
import { Card } from './UI'

interface PersonalizedFeedProps {
  limit?: number
  surface?: string
  onError?: (error: Error) => void
}

/**
 * Component to display personalized recommendations
 * Uses the recommendation service to show curated content for the user
 */
export default function PersonalizedFeed({ 
  limit = 10, 
  surface = 'main_feed',
  onError 
}: PersonalizedFeedProps) {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<any>(null)

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get user's location if available
      const userLocation = await getUserLocation()
      
      const response = await getPersonalizedFeed({
        limit,
        surface,
        lat: userLocation?.latitude,
        lon: userLocation?.longitude
      })
      
      setRecommendations(response.items)
      setMetadata(response.metadata)
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load recommendations'
      setError(errorMessage)
      if (onError) onError(err)
      console.error('Failed to load recommendations:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecommendations()
  }, [limit, surface])

  const getUserLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            })
          },
          () => resolve(null),
          { timeout: 5000, maximumAge: 300000 } // 5 min cache
        )
      } else {
        resolve(null)
      }
    })
  }

  // Convert RecommendationItem to CivicPost format for FeedCard
  const toCivicPost = (item: RecommendationItem): CivicPost => {
    return {
      id: item.id,
      title: item.title,
      content: item.content,
      post_type: (item.post_type || 'discussion') as 'issue' | 'announcement' | 'news' | 'accomplishment' | 'discussion',
      user_id: item.author_id,
      author: {
        id: item.author_id,
        username: item.author_username,
        display_name: item.author_username,
        avatar_url: undefined,
        verified: false,
        role_name: undefined,
        rep_accounts: undefined,
        followers_count: 0,
        following_count: 0
      },
      created_at: item.created_at,
      updated_at: item.created_at,
      latitude: item.latitude || undefined,
      longitude: item.longitude || undefined,
      location: item.location || undefined,
      tags: item.tags || [],
      upvotes: 0,
      downvotes: 0,
      comment_count: 0,
      view_count: 0,
      share_count: 0,
      priority_score: item.quality_score,
      is_upvoted: false,
      is_downvoted: false,
      is_saved: false,
      status: 'open',
      media_urls: [],
      // Add recommendation metadata as custom fields
      _recommendation_meta: {
        quality_score: item.quality_score,
        engagement_rate: item.engagement_rate,
        personal_affinity: item.personal_affinity,
        social_proximity: item.social_proximity,
        locality_match: item.locality_match,
        candidate_source: item.candidate_source,
        ranking_reasons: item.ranking_reasons
      }
    } as CivicPost
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Loading personalized recommendations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card variant="elevated" padding="lg" className="mb-4">
        <div className="flex items-start space-x-3 text-amber-700">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Unable to load recommendations</h3>
            <p className="text-sm text-gray-600 mb-3">{error}</p>
            <button
              onClick={loadRecommendations}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </Card>
    )
  }

  if (recommendations.length === 0) {
    return (
      <Card variant="elevated" padding="lg" className="mb-4">
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">No recommendations yet</h3>
          <p className="text-gray-600 text-sm">
            Start following users and interacting with posts to get personalized recommendations!
          </p>
        </div>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900">For You</h2>
          {metadata?.latency_ms && (
            <span className="text-xs text-gray-500">
              ({metadata.latency_ms}ms)
            </span>
          )}
        </div>
        <button
          onClick={loadRecommendations}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh recommendations"
        >
          <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Recommendation reason info (optional) */}
      {recommendations.length > 0 && recommendations[0].ranking_reasons?.length > 0 && (
        <Card variant="elevated" padding="sm" className="mb-4 bg-primary-50 border-primary-200">
          <div className="flex items-start gap-2 text-sm text-primary-800">
            <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">Personalized for you</span>
              <span className="text-primary-700 ml-1">
                · Based on your interests, follows, and activity
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Feed items */}
      <div className="space-y-4">
        {recommendations.map((item) => (
          <FeedCard
            key={item.id}
            post={toCivicPost(item)}
          />
        ))}
      </div>

      {/* Footer metadata */}
      {metadata && (
        <div className="mt-6 text-center text-xs text-gray-500">
          Showing {recommendations.length} personalized recommendations
          {metadata.cache_available && ' · Cached results'}
        </div>
      )}
    </motion.div>
  )
}
