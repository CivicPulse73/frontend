import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Plus, Bell, Search, User, Compass } from 'lucide-react'
import { motion } from 'framer-motion'

const navigationItems = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'search', label: 'Search', icon: Search, path: '/search' },
  { id: 'post', label: 'Post', icon: Plus, path: '/post' },
  { id: 'activity', label: 'Activity', icon: Bell, path: '/activity' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
]

export default function BottomNavigation() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleHomeClick = () => {
    if (location.pathname === '/') {
      // If already on home page, scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // If on different page, navigate to home
      navigate('/')
    }
  }

  const handleNavigation = (path: string) => {
    if (path === '/') {
      handleHomeClick()
    } else {
      navigate(path)
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 z-50 shadow-lg">
      <div className="max-w-lg mx-auto px-4 py-2">
        <div className="flex items-center justify-around">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`nav-item relative ${
                  isActive 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                whileTap={{ scale: 0.95 }}
                initial={false}
                animate={{
                  scale: isActive ? 1.05 : 1,
                }}
                transition={{ 
                  duration: 0.2,
                  ease: "easeInOut"
                }}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    className="absolute -top-1 left-1/2 w-1 h-1 bg-primary-600 rounded-full"
                    initial={{ scale: 0, x: '-50%' }}
                    animate={{ scale: 1, x: '-50%' }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                
                <Icon 
                  className={`w-5 h-5 transition-all duration-200 ${
                    isActive ? 'scale-110' : ''
                  }`} 
                />
                <span className={`text-xs font-medium transition-all duration-200 ${
                  isActive ? 'font-semibold' : ''
                }`}>
                  {item.label}
                </span>
                
                {/* Special highlight for post button */}
                {item.id === 'post' && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl opacity-0 -z-10"
                    whileHover={{ opacity: 0.1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
