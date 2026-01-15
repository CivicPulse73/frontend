import { apiClient } from './api'

export interface RecommendationItem {
  id: string
  title: string
  content: string
  post_type: string | null
  author_id: string
  author_username: string
  created_at: string
  latitude: number | null
  longitude: number | null
  location: string | null
  tags: string[] | null
  quality_score: number
  engagement_rate: number
  recency_decay: number
  personal_affinity: number
  social_proximity: number
  locality_match: number
  candidate_source: string
  ranking_reasons: string[]
}

export interface RecommendationResponse {
  user_id: string
  surface: string
  generated_at: string
  count: number
  items: RecommendationItem[]
  metadata: {
    latency_ms?: number
    cache_available?: boolean
    service?: string
    [key: string]: any
  }
}

export interface RecommendationFeedParams {
  limit?: number
  lat?: number
  lon?: number
  surface?: string
}

/**
 * Get personalized feed recommendations for the current user
 */
export async function getPersonalizedFeed(
  params: RecommendationFeedParams = {}
): Promise<RecommendationResponse> {
  const { limit = 20, lat, lon, surface = 'main_feed' } = params
  
  const queryParams = new URLSearchParams({
    limit: limit.toString(),
    surface
  })
  
  if (lat !== undefined) queryParams.append('lat', lat.toString())
  if (lon !== undefined) queryParams.append('lon', lon.toString())
  
  const response = await apiClient.get<RecommendationResponse>(
    `/recommendations/feed?${queryParams.toString()}`
  )
  
  return response
}

/**
 * Invalidate the recommendation cache for the current user
 * Call this after significant user actions like following/unfollowing
 */
export async function invalidateRecommendationCache(): Promise<{
  success: boolean
  user_id: string
  invalidated: boolean
  message: string
}> {
  const response = await apiClient.post<{
    success: boolean
    user_id: string
    invalidated: boolean
    message: string
  }>('/recommendations/cache/invalidate')
  
  return response
}

/**
 * Check if the recommendation service is healthy
 */
export async function checkRecommendationHealth(): Promise<{
  status: string
  recommendation_service: string
  message?: string
}> {
  const response = await apiClient.get<{
    status: string
    recommendation_service: string
    message?: string
  }>('/recommendations/health')
  
  return response
}
