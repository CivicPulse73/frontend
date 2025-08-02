import React from 'react'
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Eye,
  Calendar,
  User
} from 'lucide-react'

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

interface StatusConfig {
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: React.ComponentType<any>
  gradient: string
  pulseColor?: string
}

const statusConfig: Record<TicketStatus, StatusConfig> = {
  open: {
    label: 'Open',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: AlertCircle,
    gradient: 'from-red-500 to-red-600',
    pulseColor: 'bg-red-400'
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: Clock,
    gradient: 'from-amber-500 to-orange-500',
    pulseColor: 'bg-amber-400'
  },
  resolved: {
    label: 'Resolved',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: CheckCircle2,
    gradient: 'from-green-500 to-emerald-500'
  },
  closed: {
    label: 'Closed',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: XCircle,
    gradient: 'from-gray-500 to-gray-600'
  }
}

// 1. Minimal Badge Component
interface StatusBadgeProps {
  status: TicketStatus
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'subtle'
  showIcon?: boolean
  className?: string
  onClick?: () => void
}

export function StatusBadge({ 
  status, 
  size = 'md', 
  variant = 'default', 
  showIcon = true,
  className = '',
  onClick
}: StatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  }

  const variantClasses = {
    default: `${config.bgColor} ${config.color} ${config.borderColor} border`,
    outline: `bg-white ${config.color} ${config.borderColor} border-2`,
    subtle: `${config.bgColor} ${config.color} border-transparent border`
  }

  const Component = onClick ? 'button' : 'span'

  return (
    <Component 
      className={`
        inline-flex items-center space-x-1.5 rounded-full font-medium
        ${sizeClasses[size]} 
        ${variantClasses[variant]}
        ${onClick ? 'hover:opacity-80 transition-opacity cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{config.label}</span>
    </Component>
  )
}

// 2. Enhanced Card with Progress Visualization
interface StatusCardProps {
  status: TicketStatus
  title: string
  description?: string
  updatedAt?: string
  assignee?: string
  showProgress?: boolean
  onClick?: () => void
}

export function StatusCard({ 
  status, 
  title, 
  description, 
  updatedAt, 
  assignee,
  showProgress = true,
  onClick 
}: StatusCardProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  const getProgressValue = () => {
    switch (status) {
      case 'open': return 25
      case 'in_progress': return 65
      case 'resolved': return 100
      case 'closed': return 100
      default: return 0
    }
  }

  return (
    <div 
      className={`
        relative bg-white rounded-xl border ${config.borderColor} p-6 
        hover:shadow-lg transition-all duration-300 cursor-pointer
        ${onClick ? 'hover:scale-[1.02]' : ''}
      `}
      onClick={onClick}
    >
      {/* Status Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`
            p-2 rounded-lg ${config.bgColor} relative
            ${status === 'in_progress' ? 'animate-pulse' : ''}
          `}>
            <Icon className={`w-5 h-5 ${config.color}`} />
            {status === 'in_progress' && (
              <div className={`
                absolute inset-0 rounded-lg ${config.pulseColor} 
                animate-ping opacity-30
              `} />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className={`text-sm font-medium ${config.color}`}>
              {config.label}
            </p>
          </div>
        </div>
        
        <StatusBadge status={status} size="sm" variant="outline" />
      </div>

      {/* Description */}
      {description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {description}
        </p>
      )}

      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-500">Progress</span>
            <span className="text-xs font-medium text-gray-700">
              {getProgressValue()}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`
                h-2 rounded-full bg-gradient-to-r ${config.gradient}
                transition-all duration-500 ease-out
              `}
              style={{ width: `${getProgressValue()}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          {assignee && (
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>{assignee}</span>
            </div>
          )}
          {updatedAt && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{updatedAt}</span>
            </div>
          )}
        </div>
        
        {onClick && (
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
        )}
      </div>
    </div>
  )
}

// 3. Status Timeline Component
interface StatusTimelineProps {
  currentStatus: TicketStatus
  timeline?: Array<{
    status: TicketStatus
    timestamp: string
    user?: string
    note?: string
  }>
}

export function StatusTimeline({ currentStatus, timeline }: StatusTimelineProps) {
  const allStatuses: TicketStatus[] = ['open', 'in_progress', 'resolved', 'closed']
  
  const getCurrentIndex = () => {
    if (currentStatus === 'closed') return 3
    return allStatuses.indexOf(currentStatus)
  }

  const currentIndex = getCurrentIndex()

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 mb-4">Status Timeline</h3>
      
      <div className="relative">
        {allStatuses.map((status, index) => {
          const config = statusConfig[status]
          const Icon = config.icon
          const isCompleted = index <= currentIndex
          const isCurrent = index === currentIndex
          
          return (
            <div key={status} className="relative flex items-center pb-8 last:pb-0">
              {/* Timeline Line */}
              {index < allStatuses.length - 1 && (
                <div className={`
                  absolute left-6 top-12 w-0.5 h-16 
                  ${isCompleted ? 'bg-gradient-to-b from-green-400 to-green-500' : 'bg-gray-200'}
                `} />
              )}
              
              {/* Status Icon */}
              <div className={`
                relative z-10 flex items-center justify-center w-12 h-12 rounded-full
                ${isCompleted 
                  ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg` 
                  : 'bg-gray-100 text-gray-400'
                }
                ${isCurrent ? 'ring-4 ring-blue-100' : ''}
                transition-all duration-300
              `}>
                <Icon className="w-5 h-5" />
                {isCurrent && (
                  <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-30" />
                )}
              </div>
              
              {/* Status Info */}
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`
                    font-medium 
                    ${isCompleted ? 'text-gray-900' : 'text-gray-500'}
                  `}>
                    {config.label}
                  </h4>
                  {isCompleted && timeline?.[index] && (
                    <span className="text-xs text-gray-500">
                      {timeline[index].timestamp}
                    </span>
                  )}
                </div>
                
                {isCompleted && timeline?.[index]?.note && (
                  <p className="text-sm text-gray-600 mt-1">
                    {timeline[index].note}
                  </p>
                )}
                
                {isCompleted && timeline?.[index]?.user && (
                  <p className="text-xs text-gray-500 mt-1">
                    by {timeline[index].user}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// 4. Interactive Status Selector (for admins/representatives)
interface StatusSelectorProps {
  currentStatus: TicketStatus
  onStatusChange: (status: TicketStatus) => void
  disabled?: boolean
  allowedTransitions?: TicketStatus[]
}

export function StatusSelector({ 
  currentStatus, 
  onStatusChange, 
  disabled = false,
  allowedTransitions
}: StatusSelectorProps) {
  const getNextStatuses = (current: TicketStatus): TicketStatus[] => {
    if (allowedTransitions) return allowedTransitions
    
    switch (current) {
      case 'open': return ['in_progress', 'closed']
      case 'in_progress': return ['resolved', 'open', 'closed']
      case 'resolved': return ['closed', 'in_progress']
      case 'closed': return ['open']
      default: return []
    }
  }

  const nextStatuses = getNextStatuses(currentStatus)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Current Status</h3>
        <StatusBadge status={currentStatus} size="sm" />
      </div>
      
      {!disabled && nextStatuses.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Update to:</p>
          <div className="grid grid-cols-2 gap-2">
            {nextStatuses.map((status) => {
              const config = statusConfig[status]
              const Icon = config.icon
              
              return (
                <button
                  key={status}
                  onClick={() => onStatusChange(status)}
                  className={`
                    flex items-center space-x-2 p-3 rounded-lg border-2 border-dashed
                    ${config.borderColor} ${config.bgColor} hover:bg-opacity-80
                    transition-all duration-200 hover:scale-105 active:scale-95
                  `}
                >
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className={`text-sm font-medium ${config.color}`}>
                    {config.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// 5. Compact Status Indicator (for lists/feeds)
interface StatusIndicatorProps {
  status: TicketStatus
  size?: 'xs' | 'sm' | 'md'
  showLabel?: boolean
  showPulse?: boolean
}

export function StatusIndicator({ 
  status, 
  size = 'sm', 
  showLabel = false,
  showPulse = true 
}: StatusIndicatorProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  const sizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-3 h-3',
    md: 'w-4 h-4'
  }

  const dotSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-3 h-3'
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <div className={`
          rounded-full ${config.bgColor} ${config.borderColor} border-2
          ${dotSizes[size]}
        `} />
        {showPulse && status === 'in_progress' && (
          <div className={`
            absolute inset-0 rounded-full ${config.pulseColor} 
            animate-ping opacity-75
          `} />
        )}
      </div>
      
      {showLabel && (
        <span className={`text-xs font-medium ${config.color}`}>
          {config.label}
        </span>
      )}
    </div>
  )
}
