import { useState, useEffect } from 'react'
import { Users, UserCheck } from 'lucide-react'
import { followService } from '../services/follows'
import { FollowStats as FollowStatsType } from '../types'

interface FollowStatsProps {
  userId: string
  initialStats?: FollowStatsType
  onClick?: (type: 'followers' | 'following') => void
  className?: string
  showIcons?: boolean
  size?: 'sm' | 'md' | 'lg'
  layout?: 'horizontal' | 'vertical'
}

export default function FollowStats({
  userId,
  initialStats,
  onClick,
  className = '',
  showIcons = true,
  size = 'md',
  layout = 'horizontal'
}: FollowStatsProps) {
  const [stats, setStats] = useState<FollowStatsType | null>(initialStats || null)
  const [isLoading, setIsLoading] = useState(!initialStats)

  useEffect(() => {
    const loadStats = async () => {
      if (initialStats) return

      try {
        setIsLoading(true)
        const followStats = await followService.getFollowStats(userId)
        setStats(followStats)
      } catch (error) {
        console.error('Failed to load follow stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [userId, initialStats])

  // Update stats when initialStats changes
  useEffect(() => {
    if (initialStats) {
      setStats(initialStats)
    }
  }, [initialStats])

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const spacingClasses = layout === 'horizontal' ? 'space-x-6' : 'space-y-2'
  const flexDirection = layout === 'horizontal' ? 'flex-row' : 'flex-col'

  if (isLoading) {
    return (
      <div className={`flex ${flexDirection} ${spacingClasses} ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  const StatItem = ({ 
    type, 
    count, 
    label, 
    icon: Icon 
  }: { 
    type: 'followers' | 'following'
    count: number
    label: string
    icon: any 
  }) => (
    <button
      onClick={() => onClick?.(type)}
      className={`
        flex items-center space-x-1 transition-colors duration-200
        ${onClick ? 'hover:text-blue-600 cursor-pointer' : 'cursor-default'}
        ${sizeClasses[size]}
      `}
      disabled={!onClick}
    >
      {showIcons && <Icon className={`text-gray-500 ${iconSizes[size]}`} />}
      <span className="font-semibold text-gray-900">{formatCount(count)}</span>
      <span className="text-gray-600">{label}</span>
    </button>
  )

  return (
    <div className={`flex ${flexDirection} ${spacingClasses} ${className}`}>
      <StatItem
        type="followers"
        count={stats.followers_count}
        label={stats.followers_count === 1 ? 'Follower' : 'Followers'}
        icon={Users}
      />
      <StatItem
        type="following"
        count={stats.following_count}
        label="Following"
        icon={UserCheck}
      />
    </div>
  )
}
