import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Plus, Bell, Search, User } from 'lucide-react'

const navigationItems = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'explore', label: 'Explore', icon: Search, path: '/explore' },
  { id: 'post', label: 'Post', icon: Plus, path: '/post' },
  { id: 'activity', label: 'Activity', icon: Bell, path: '/activity' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
]

export default function BottomNavigation() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-lg mx-auto px-4 py-2">
        <div className="flex items-center justify-around">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`nav-item ${isActive ? 'active' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
