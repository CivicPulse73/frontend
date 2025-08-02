import { useState } from 'react'
import { ChevronDown, Check, AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { CivicPost } from '../../types'
import { TicketStatus } from '../UI/TicketStatus'
import { postsService } from '../../services/posts'

interface StatusUpdateDropdownProps {
  post: CivicPost
  onStatusUpdate?: (postId: string, newStatus: TicketStatus) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  dropdownPosition?: 'left' | 'right'
}

const statusOptions = [
  {
    value: 'open' as TicketStatus,
    label: 'Open',
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    description: 'Issue reported and awaiting action'
  },
  {
    value: 'in_progress' as TicketStatus,
    label: 'In Progress',
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: 'Work has started on this issue'
  },
  {
    value: 'resolved' as TicketStatus,
    label: 'Resolved',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: 'Issue has been fixed and completed'
  },
  {
    value: 'closed' as TicketStatus,
    label: 'Closed',
    icon: XCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    description: 'Issue has been closed without resolution'
  }
]

export default function StatusUpdateDropdown({ 
  post, 
  onStatusUpdate, 
  className = '',
  size = 'md',
  dropdownPosition = 'right'
}: StatusUpdateDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const currentStatus = post.status || 'open'
  const currentStatusOption = statusOptions.find(option => option.value === currentStatus)

  const handleStatusUpdate = async (newStatus: TicketStatus) => {
    if (newStatus === currentStatus || isUpdating) return

    try {
      setIsUpdating(true)
      setIsOpen(false)

      await postsService.updatePostStatus(post.id, newStatus)
      
      // Call the callback to update the UI
      if (onStatusUpdate) {
        onStatusUpdate(post.id, newStatus)
      }

    } catch (error) {
      console.error('Failed to update status:', error)
      // You might want to show a toast notification here
      alert('Failed to update status. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const getSize = () => {
    switch (size) {
      case 'sm': return 'text-xs px-2 py-1'
      case 'lg': return 'text-base px-4 py-3'
      default: return 'text-sm px-3 py-2'
    }
  }

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'w-3 h-3'
      case 'lg': return 'w-5 h-5'
      default: return 'w-4 h-4'
    }
  }

  if (!currentStatusOption) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`
          ${getSize()}
          ${currentStatusOption.bgColor} 
          ${currentStatusOption.borderColor}
          ${currentStatusOption.color}
          border rounded-lg font-medium transition-all duration-200
          hover:shadow-md hover:scale-105 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center space-x-2 min-w-fit
        `}
      >
        {isUpdating ? (
          <div className={`${getIconSize()} border-2 border-current border-t-transparent rounded-full animate-spin`} />
        ) : (
          <currentStatusOption.icon className={getIconSize()} />
        )}
        <span className="capitalize">{currentStatusOption.label}</span>
        <ChevronDown className={`${getIconSize()} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className={`absolute ${dropdownPosition === 'left' ? 'left-0' : 'right-0'} top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden`}>
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-3 py-2 border-b border-gray-100 mb-2">
                Update Status
              </div>
              
              {statusOptions.map((option) => {
                const isSelected = option.value === currentStatus
                const IconComponent = option.icon
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handleStatusUpdate(option.value)}
                    disabled={isSelected || isUpdating}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg transition-all duration-200
                      hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                      ${isSelected ? 'bg-gray-50' : 'hover:shadow-sm'}
                      flex items-start space-x-3
                    `}
                  >
                    <div className={`
                      p-1.5 rounded-lg ${option.bgColor} ${option.borderColor} border mt-0.5
                    `}>
                      <IconComponent className={`w-3 h-3 ${option.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${option.color}`}>
                          {option.label}
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {option.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
