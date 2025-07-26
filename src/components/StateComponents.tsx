import React from 'react'
import { motion } from 'framer-motion'
import { Loader2, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { Card, Button } from './UI'

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading...', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'py-4',
    md: 'py-8',
    lg: 'py-12'
  }

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <motion.div 
      className={`flex flex-col items-center justify-center ${sizeClasses[size]}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className={`${iconSizes[size]} text-primary-600 mb-3`} />
      </motion.div>
      <p className="text-gray-600 text-center">{message}</p>
    </motion.div>
  )
}

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
  icon?: React.ReactNode
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
  icon
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="elevated" padding="lg" className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          {icon || <AlertCircle className="w-8 h-8 text-red-500" />}
        </motion.div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">{message}</p>
        
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="primary"
            icon={<RefreshCw className="w-4 h-4" />}
            className="mx-auto"
          >
            {retryLabel}
          </Button>
        )}
      </Card>
    </motion.div>
  )
}

interface EmptyStateProps {
  title: string
  message: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon,
  action
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="outlined" padding="lg" className="text-center bg-gray-50">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          {icon || <AlertCircle className="w-8 h-8 text-gray-400" />}
        </motion.div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">{message}</p>
        
        {action && (
          <Button
            onClick={action.onClick}
            variant="primary"
            className="mx-auto"
          >
            {action.label}
          </Button>
        )}
      </Card>
    </motion.div>
  )
}

interface NetworkStatusProps {
  isOnline: boolean
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ isOnline }) => {
  if (isOnline) return null

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      className="fixed top-16 left-4 right-4 z-40"
    >
      <Card variant="elevated" padding="sm" className="bg-red-50 border-red-200">
        <div className="flex items-center justify-center space-x-2 text-red-700">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">No internet connection</span>
        </div>
      </Card>
    </motion.div>
  )
}

export default {
  LoadingState,
  ErrorState,
  EmptyState,
  NetworkStatus
}
