import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Notification } from '../types'
import { useUser } from './UserContext'
import { notificationsService } from '../services/notifications'

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  addNotification: (notification: Omit<Notification, 'id'>) => void
  refresh: () => Promise<void>
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

  // Fetch notifications from API
  const fetchNotifications = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const response = await notificationsService.getNotifications({})
      setNotifications(response.items)
    } catch (err) {
      console.warn('Failed to fetch notifications from API, using fallback data:', err)
      setError('Unable to load notifications')
      
      // Set empty notifications on error
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  // Load notifications when user changes
  useEffect(() => {
    fetchNotifications()
  }, [user])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
    
    // API call to persist the change
    try {
      await notificationsService.markAsRead(id)
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
      
      // Revert optimistic update on failure
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: false }
            : notification
        )
      )
    }
  }

  const markAllAsRead = async () => {
    if (!user) return

    // Store current state for potential revert
    const previousNotifications = notifications

    // Optimistic update
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
    
    try {
      await notificationsService.markAllAsRead()
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
      
      // Revert optimistic update on failure
      setNotifications(previousNotifications)
    }
  }

  const addNotification = (newNotification: Omit<Notification, 'id'>) => {
    const notification: Notification = {
      ...newNotification,
      id: Date.now().toString()
    }
    setNotifications(prev => [notification, ...prev])
  }

  const refresh = async () => {
    await fetchNotifications()
  }

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
        refresh
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
