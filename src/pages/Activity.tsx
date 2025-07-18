import { useState } from 'react'
import { Bell, CheckCircle, MessageCircle, ArrowUp, Clock, User, RefreshCw, AlertCircle } from 'lucide-react'
import { useNotifications } from '../contexts/NotificationContext'
import { usePosts } from '../contexts/PostContext'
import { useNavigate } from 'react-router-dom'
import NotificationModal from '../components/NotificationModal'
import { Notification } from '../types'

type ActivityFilter = 'all' | 'unread' | 'status_update' | 'comment' | 'upvote' | 'mention'

export default function Activity() {
  const { notifications, unreadCount, loading, error, markAsRead, markAllAsRead, refresh } = useNotifications()
  const { posts } = usePosts()
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState<ActivityFilter>('all')
  const [justMarkedRead, setJustMarkedRead] = useState<string | null>(null)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'status_update': return <CheckCircle className="w-5 h-5 text-blue-600" />
      case 'comment': return <MessageCircle className="w-5 h-5 text-green-600" />
      case 'upvote': return <ArrowUp className="w-5 h-5 text-purple-600" />
      case 'mention': return <User className="w-5 h-5 text-yellow-600" />
      default: return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getActivityColor = (type: string, read: boolean) => {
    if (read) return 'bg-white border-gray-200'
    
    switch (type) {
      case 'status_update': return 'bg-blue-50 border-blue-200'
      case 'comment': return 'bg-green-50 border-green-200'
      case 'upvote': return 'bg-purple-50 border-purple-200'
      case 'mention': return 'bg-yellow-50 border-yellow-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const getPostTitle = (postId?: string) => {
    if (!postId) return null
    const post = posts.find(p => p.id === postId)
    return post?.title || 'Unknown Post'
  }

  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'unread') return !notification.read
    return notification.notification_type === activeFilter
  })

  const handleNotificationClick = (notification: Notification) => {
    // Only mark as read when user explicitly clicks
    if (!notification.read) {
      markAsRead(notification.id)
      // Add visual feedback
      setJustMarkedRead(notification.id)
      setTimeout(() => setJustMarkedRead(null), 1000)
    }
    
    // Open modal to show notification details
    setSelectedNotification(notification)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedNotification(null)
  }

  const handleNavigateToPost = (postId: string) => {
    navigate('/')
    console.log('Navigate to post:', postId)
  }

  const filterOptions = [
    { label: 'All', value: 'all' as ActivityFilter },
    { label: 'Unread', value: 'unread' as ActivityFilter },
    { label: 'Updates', value: 'status_update' as ActivityFilter },
    { label: 'Comments', value: 'comment' as ActivityFilter },
    { label: 'Upvotes', value: 'upvote' as ActivityFilter },
    { label: 'Mentions', value: 'mention' as ActivityFilter },
  ]

  return (
    <div className="max-w-lg mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Activity</h1>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <>
                <span className="text-sm text-gray-600">
                  {unreadCount} unread
                </span>
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
              </>
            )}
            {error && (
              <button
                onClick={refresh}
                className="flex items-center space-x-1 text-sm text-orange-600 hover:text-orange-700"
                title="Retry loading notifications"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            )}
          </div>
        </div>
        <p className="text-gray-600">Stay updated on your civic engagement</p>
        
        {/* Error Banner */}
        {error && (
          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
            <span className="text-sm text-orange-700">{error}</span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-3 mb-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Tags */}
      {!loading && (
        <div className="mb-6">
          <div className="relative">
            <div className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2 px-1">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setActiveFilter(option.value)}
                  className={`flex-shrink-0 py-2 px-4 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap border ${
                    activeFilter === option.value
                      ? 'bg-primary-600 text-white shadow-md border-primary-600 scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  {option.label}
                  {option.value === 'unread' && unreadCount > 0 && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeFilter === option.value 
                        ? 'bg-white text-primary-600' 
                        : 'bg-primary-600 text-white'
                    }`}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
            {/* Fade indicator for scrollable content */}
            <div className="absolute top-0 right-0 h-full w-6 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none"></div>
          </div>
        </div>
      )}

      {/* Activity List */}
      {!loading && (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className={`rounded-lg border p-4 transition-all duration-200 cursor-pointer hover:shadow-md ${
              getActivityColor(notification.notification_type, notification.read)
            } ${justMarkedRead === notification.id ? 'ring-2 ring-green-300 bg-green-50' : ''}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(notification.notification_type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                      {notification.message}
                    </p>
                    {notification.post_id && (
                      <p className="text-xs text-gray-500 mt-1">
                        Post: "{getPostTitle(notification.post_id)}"
                      </p>
                    )}
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1 ml-2" />
                  )}
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatTimeAgo(new Date(notification.created_at))}</span>
                  <span className="capitalize bg-gray-100 px-2 py-1 rounded-full">
                    {notification.notification_type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeFilter === 'all' ? 'No notifications yet' : 
             activeFilter === 'unread' ? 'No unread notifications' : 
             `No ${filterOptions.find(f => f.value === activeFilter)?.label.toLowerCase()} notifications`}
          </h3>
          <p className="text-gray-500">
            {activeFilter === 'all' 
              ? "You'll see updates about your posts and community activity here."
              : activeFilter === 'unread'
              ? "All caught up! No new notifications to review."
              : `No ${filterOptions.find(f => f.value === activeFilter)?.label.toLowerCase()} notifications yet.`
            }
          </p>
        </div>
      )}

      {/* Mark All as Read */}
      {!loading && unreadCount > 0 && (
        <div className="mt-6 text-center">
          <button 
            onClick={markAllAsRead}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Mark all as read ({unreadCount})
          </button>
        </div>
      )}

      {/* Quick Stats */}
      {!loading && notifications.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Activity Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">{notifications.length}</div>
              <div className="text-xs text-gray-500">Total Notifications</div>
            </div>
            <div>
              <div className="text-lg font-bold text-primary-600">{unreadCount}</div>
              <div className="text-xs text-gray-500">Unread</div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal
        notification={selectedNotification}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onMarkAsRead={markAsRead}
        onNavigateToPost={handleNavigateToPost}
      />
    </div>
  )
}
