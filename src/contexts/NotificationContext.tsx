import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react'
import { Notification } from '../types'
import { useUser } from './UserContext'
import { notificationsService, NotificationFilters } from '../services/notifications'
import { notificationWebSocketService, WebSocketNotificationEnvelope } from '../services/notificationWebsocket'
import { ConnectionStatus } from '../services/websocket'
import { webSocketConfigService, WebSocketConfig } from '../services/webSocketConfig'

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  addNotification: (notification: Omit<Notification, 'id'>) => void
  refresh: (filters?: NotificationFilters) => Promise<void>
  connectionStatus: ConnectionStatus
  realtimeEnabled: boolean
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState(ConnectionStatus.DISCONNECTED)
  const [realtimeEnabled, setRealtimeEnabled] = useState<boolean>(
    webSocketConfigService.isFeatureEnabled('notifications')
  )
  const [unreadCountFromAPI, setUnreadCountFromAPI] = useState<number>(0)
  const fetchInProgressRef = useRef(false)
  const fetchTimeoutRef = useRef<number | null>(null)

  const mergeNotification = (notification: Notification) => {
    setNotifications(prev => {
      const existingIndex = prev.findIndex(item => item.id === notification.id)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = { ...prev[existingIndex], ...notification }
        return updated
      }
      return [notification, ...prev]
    })
  }

  const upsertRealtimeNotification = (payload: WebSocketNotificationEnvelope) => {
    const data = payload.data || {}

    const notification: Notification = {
      id: String(data.id ?? payload.message_id ?? Date.now()),
      user_id: (data.user_id as string) ?? user?.id ?? '',
      post_id: data.post_id as string | undefined,
      comment_id: data.comment_id as string | undefined,
      triggered_by_user_id: data.triggered_by_user_id as string | undefined,
      notification_type: (
        data.notification_type ||
        data.type ||
        'notification'
      ) as Notification['notification_type'],
      title: (data.title as string) || 'Notification',
      message: (data.message as string) || (data.description as string) || '',
      action_url: data.action_url as string | undefined,
  read: Boolean(data.read ?? false),
  read_at: (data.read_at as string | undefined) ?? undefined,
      created_at:
        (data.timestamp as string) ||
        (data.created_at as string) ||
        new Date().toISOString(),
    }

    mergeNotification(notification)
  }

  // Fetch unread count from API
  const fetchUnreadCount = async () => {
    if (!user) return
    
    try {
      const count = await notificationsService.getUnreadCount()
      setUnreadCountFromAPI(count)
    } catch (err) {
      console.warn('Failed to fetch unread count:', err)
      // Don't set error state for unread count failure, just log it
    }
  }

  // Fetch notifications from API
  const fetchNotifications = async (filters?: NotificationFilters) => {
    if (!user) return
    
    // If a fetch is in progress, wait for it to complete before starting a new one
    if (fetchInProgressRef.current) {
      console.log('Fetch already in progress, waiting...')
      // Wait a bit and try again
      await new Promise(resolve => setTimeout(resolve, 100))
      if (fetchInProgressRef.current) {
        console.log('Still in progress, skipping...')
        return
      }
    }

    fetchInProgressRef.current = true
    setLoading(true)
    setError(null)

    try {
      const response = await notificationsService.getNotifications(filters || {})
      // Always update with the latest response, even if it's empty
      setNotifications(response.items || [])
      
      // Also fetch unread count for accuracy
      await fetchUnreadCount()
    } catch (err) {
      console.warn('Failed to fetch notifications from API:', err)
      setError('Unable to load notifications')
      
      // Set empty notifications on error
      setNotifications([])
    } finally {
      setLoading(false)
      fetchInProgressRef.current = false
    }
  }

  // Load notifications when user changes
  useEffect(() => {
    fetchNotifications()
  }, [user])

  useEffect(() => {
    const handleConfigChange = (config: WebSocketConfig) => {
      setRealtimeEnabled(config.enabled && !!config.features.notifications)
    }

    const handleRealtimeNotification = (message: WebSocketNotificationEnvelope) => {
      upsertRealtimeNotification(message)
    }

    const handleStatusChange = (status: ConnectionStatus) => {
      setConnectionStatus(status)
    }

    const handleSocketError = (socketError: Error) => {
      setError(socketError.message)
    }

    webSocketConfigService.addConfigListener(handleConfigChange)
    notificationWebSocketService.on('notification', handleRealtimeNotification)
    notificationWebSocketService.on('connectionStatusChanged', handleStatusChange)
    notificationWebSocketService.on('error', handleSocketError)

    if (user && realtimeEnabled) {
      notificationWebSocketService.connect()
    }

    return () => {
      webSocketConfigService.removeConfigListener(handleConfigChange)
      notificationWebSocketService.off('notification', handleRealtimeNotification)
      notificationWebSocketService.off('connectionStatusChanged', handleStatusChange)
      notificationWebSocketService.off('error', handleSocketError)
      notificationWebSocketService.disconnect()
    }
  }, [user, realtimeEnabled])

  // Use API unread count if available, otherwise calculate from loaded notifications
  const unreadCount = unreadCountFromAPI > 0 
    ? unreadCountFromAPI 
    : notifications.filter(n => !n.read).length

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
    
    // Optimistically decrease unread count
    if (unreadCountFromAPI > 0) {
      setUnreadCountFromAPI(prev => Math.max(0, prev - 1))
    }
    
    // API call to persist the change
    try {
      await notificationsService.markAsRead(id)
      // Refresh unread count after successful API call
      await fetchUnreadCount()
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
      
      // Revert optimistic updates on failure
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: false }
            : notification
        )
      )
      
      // Refresh count to get accurate value
      await fetchUnreadCount()
    }
  }

  const markAllAsRead = async () => {
    if (!user) return

    // Store current state for potential revert
    const previousNotifications = notifications
    const previousUnreadCount = unreadCountFromAPI

    // Optimistic update
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
    setUnreadCountFromAPI(0)
    
    try {
      await notificationsService.markAllAsRead()
      // Refresh unread count after successful API call
      await fetchUnreadCount()
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
      
      // Revert optimistic updates on failure
      setNotifications(previousNotifications)
      setUnreadCountFromAPI(previousUnreadCount)
      
      // Refresh count to get accurate value
      await fetchUnreadCount()
    }
  }

  const addNotification = (newNotification: Omit<Notification, 'id'>) => {
    const notification: Notification = {
      ...newNotification,
      id: Date.now().toString()
    }
    mergeNotification(notification)
  }

  const refresh = async (filters?: NotificationFilters) => {
    // Clear any pending debounced calls
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current)
    }
    
    // Immediately call fetchNotifications without debounce for filter changes
    // The fetchInProgressRef will handle preventing duplicate calls
    await fetchNotifications(filters)
  }
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
      }
    }
  }, [])

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount,
        loading,
        error,
        markAsRead, 
        markAllAsRead, 
        addNotification,
        refresh,
        connectionStatus,
        realtimeEnabled
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
