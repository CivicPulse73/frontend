import { Bell, Settings, LogIn, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../contexts/UserContext'
import { useNotifications } from '../contexts/NotificationContext'
import AuthModal from './AuthModal'

export default function TopNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useUser()
  const { unreadCount } = useNotifications()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleNotificationClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Notification clicked, current location:', location.pathname, 'navigating to /activity')
    try {
      navigate('/activity')
    } catch (error) {
      console.error('Navigation error:', error)
      // Fallback: use window.location as backup
      window.location.href = '/activity'
    }
  }

  const handleSettingsClick = () => {
    navigate('/profile')
  }

  const handleLoginClick = () => {
    setShowAuthModal(true)
  }

  const handleLogoutClick = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CP</span>
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">CivicPulse</h1>
              <p className="text-xs text-gray-500">{user?.bio || 'Welcome to CivicPulse'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button 
                  onClick={handleNotificationClick}
                  onMouseDown={() => console.log('Mouse down on notification button')}
                  onMouseUp={() => console.log('Mouse up on notification button')}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors relative cursor-pointer z-10 touch-manipulation"
                  type="button"
                  aria-label="View notifications"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <Bell className="w-5 h-5 text-gray-600 pointer-events-none" />
                  {/* Notification badge with unread count */}
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center pointer-events-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                </button>
                <button 
                  onClick={handleSettingsClick}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  type="button"
                  aria-label="Settings"
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
                <button 
                  onClick={handleLogoutClick}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  type="button"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5 text-gray-600" />
                </button>
              </>
            ) : (
              <button 
                onClick={handleLoginClick}
                className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                type="button"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  )
}
