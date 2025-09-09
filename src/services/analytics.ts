import { apiClient } from './api'
import { ActivityData } from '../types'

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
  },

  async getUserActivityGraph(userId: string, days: number = 30): Promise<ActivityData[]> {
    try {
      return await apiClient.get<ActivityData[]>(`/users/${userId}/activity?days=${days}`)
    } catch (error) {
      console.error('Error getting activity data:', error)
      // Generate mock data for the last 30 days
      return this.generateMockActivityData(days)
    }
  },

  generateMockActivityData(days: number): ActivityData[] {
    const data: ActivityData[] = []
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      data.push({
        date: date.toISOString().split('T')[0],
        posts: Math.floor(Math.random() * 5),
        votes: Math.floor(Math.random() * 15),
        comments: Math.floor(Math.random() * 10)
      })
    }

    return data
  }
}
