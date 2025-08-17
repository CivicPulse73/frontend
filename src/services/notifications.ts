import { apiClient, ApiResponse, PaginatedResponse } from './api'
import { Notification } from '../types'

export interface NotificationFilters {
  page?: number
  size?: number
  read?: boolean
  type?: string
}

export const notificationsService = {
  async getNotifications(filters: NotificationFilters = {}): Promise<PaginatedResponse<Notification>> {
    const searchParams = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    const queryString = searchParams.toString()
    const endpoint = `/notifications${queryString ? `?${queryString}` : ''}`
    
    return await apiClient.get<PaginatedResponse<Notification>>(endpoint)
  },

  async markAsRead(notificationId: string): Promise<void> {
    const response = await apiClient.put<ApiResponse>(`/notifications/${notificationId}/read`)
    if (!response.success) {
      throw new Error(response.error || 'Failed to mark notification as read')
    }
  },

  async markAllAsRead(): Promise<void> {
    const response = await apiClient.put<ApiResponse>('/notifications/read-all')
    if (!response.success) {
      throw new Error(response.error || 'Failed to mark all notifications as read')
    }
  },

  async deleteNotification(notificationId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse>(`/notifications/${notificationId}`)
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete notification')
    }
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>('/notifications/unread-count')
    return response.count
  }
}
