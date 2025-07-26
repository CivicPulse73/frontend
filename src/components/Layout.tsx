import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import TopNavigation from './TopNavigation'
import BottomNavigation from './BottomNavigation'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <TopNavigation />
      
      <motion.main 
        className="pb-20 pt-20 min-h-screen"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="max-w-lg mx-auto">
          {children}
        </div>
      </motion.main>
      
      <BottomNavigation />
    </div>
  )
}
