import { apiClient } from './api'

export interface AnalyticsSummary {
  total_posts: number
  total_issues: number
  resolved_issues: number
  total_users: number
  engagement_rate: number
  popular_areas: Array<{ area: string; count: number }>
  recent_activity: Array<{ date: string; posts: number; comments: number }>
}

export interface IssueAnalytics {
  by_status: Record<string, number>
  by_area: Array<{ area: string; count: number }>
  by_category: Array<{ category: string; count: number }>
  resolution_rate: number
  average_resolution_time: number
}

export interface AreaAnalytics {
  area: string
  total_posts: number
  total_issues: number
  resolved_issues: number
  engagement_score: number
  popular_categories: Array<{ category: string; count: number }>
}

export const analyticsService = {
  async getDashboardAnalytics(): Promise<AnalyticsSummary> {
    return apiClient.get<AnalyticsSummary>('/analytics/dashboard')
  },

  async getIssueAnalytics(
    area?: string,
    date_from?: string,
    date_to?: string
  ): Promise<IssueAnalytics> {
    const params = new URLSearchParams()
    if (area) params.append('area', area)
    if (date_from) params.append('date_from', date_from)
    if (date_to) params.append('date_to', date_to)
    
    const queryString = params.toString()
    const endpoint = queryString ? `/analytics/issues?${queryString}` : '/analytics/issues'
    
    return apiClient.get<IssueAnalytics>(endpoint)
  },

  async getAreaAnalytics(area: string): Promise<AreaAnalytics> {
    return apiClient.get<AreaAnalytics>(`/analytics/areas/${encodeURIComponent(area)}`)
  }
}
