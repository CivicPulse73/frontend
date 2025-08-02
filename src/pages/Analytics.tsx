import React from 'react'
import { motion } from 'framer-motion'
import { AnalyticsDashboard } from '../components/AnalyticsDashboard'

const Analytics: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-8"
    >
      <AnalyticsDashboard />
    </motion.div>
  )
}

export default Analytics
