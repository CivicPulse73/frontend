import { X, CheckCircle, MessageCircle, ArrowUp, User, Clock, ClipboardList, Vote, Settings } from 'lucide-react'
import { Notification } from '../types'

interface NotificationModalProps {
  notification: Notification | null
  isOpen: boolean
  onClose: () => void
  onMarkAsRead: (id: string) => void
  onNavigateToPost?: (postId: string) => void
}

export default function NotificationModal({ 
  notification, 
  isOpen, 
  onClose, 
  onMarkAsRead,
  onNavigateToPost 
}: NotificationModalProps) {
  if (!isOpen || !notification) return null

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignments': return <ClipboardList className="w-8 h-8 text-orange-600" />
      case 'votes': return <Vote className="w-8 h-8 text-indigo-600" />
      case 'mentions': return <User className="w-8 h-8 text-yellow-600" />
      case 'system': return <Settings className="w-8 h-8 text-red-600" />
      default: return <Clock className="w-8 h-8 text-gray-600" />
    }
  }

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'assignments': return 'bg-orange-50'
      case 'votes': return 'bg-indigo-50'
      case 'mentions': return 'bg-yellow-50'
      case 'system': return 'bg-red-50'
      default: return 'bg-gray-50'
    }
  }

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleViewPost = () => {
    if (notification.post_id && onNavigateToPost) {
      onNavigateToPost(notification.post_id)
      onClose()
    }
  }

  const handleMarkAsRead = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Notification Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Icon and Type */}
          <div className={`${getNotificationBg(notification.notification_type)} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
            {getNotificationIcon(notification.notification_type)}
          </div>

          {/* Status Badge */}
          <div className="text-center mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              notification.read 
                ? 'bg-gray-100 text-gray-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {notification.read ? 'Read' : 'Unread'}
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 animate-pulse" />
              )}
            </span>
          </div>

          {/* Message */}
          <div className="text-center mb-6">
            <p className="text-gray-900 text-lg leading-relaxed">
              {notification.message}
            </p>
          </div>

          {/* Timestamp */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500">
              {formatFullDate(new Date(notification.created_at))}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {notification.post_id && (
              <button
                onClick={handleViewPost}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                View Related Post
              </button>
            )}
            
            {!notification.read && (
              <button
                onClick={handleMarkAsRead}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Mark as Read
              </button>
            )}
            
            <button
              onClick={onClose}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
