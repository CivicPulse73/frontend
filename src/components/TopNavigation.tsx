import { useState } from 'react'
import { Bell, Search, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function TopNavigation() {
  const navigate = useNavigate()

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200/50 z-50 shadow-sm">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-primary-600">CivicPulse</h1>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/search')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Notifications"
            >
              <Bell size={20} />
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Settings"
            >
              <Settings size={20} />
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  )
}
