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

  // Early return if userId is invalid
  if (!userId || userId === 'undefined' || userId === '') {
    return null
  }

  useEffect(() => {
    const loadStats = async () => {
      if (initialStats || !userId || userId === 'undefined' || userId === '') return

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

  const spacingClasses = layout === 'horizontal' ? 'space-x-8' : 'space-y-3'
  const flexDirection = layout === 'horizontal' ? 'flex-row' : 'flex-col'

  if (isLoading) {
    return (
      <div className={`flex ${flexDirection} ${spacingClasses} ${className}`}>
        <div className="animate-pulse flex flex-col items-center space-y-1">
          <div className="h-5 bg-gray-200 rounded w-8"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
        </div>
        <div className="animate-pulse flex flex-col items-center space-y-1">
          <div className="h-5 bg-gray-200 rounded w-8"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
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
        group flex flex-col items-center justify-center transition-all duration-200 py-2 px-3 rounded-lg
        ${onClick ? 'hover:bg-blue-50 hover:shadow-sm cursor-pointer' : 'cursor-default'}
      `}
      disabled={!onClick}
    >
      <div className={`
        font-bold text-blue-600
        ${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl'}
        ${onClick ? 'group-hover:text-blue-700 group-hover:scale-105' : ''}
        transition-all duration-200
      `}>
        {formatCount(count)}
      </div>
      <div className={`
        text-gray-500 font-medium leading-tight
        ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-xs' : 'text-sm'}
        ${onClick ? 'group-hover:text-blue-600' : ''}
        transition-colors duration-200
      `}>
        {label}
      </div>
    </button>
  )

  return (
    <div className={`flex ${flexDirection} ${spacingClasses} ${className} justify-center`}>
      <StatItem
        type="followers"
        count={stats.followers_count}
        label={stats.followers_count === 1 ? 'Follower' : 'Followers'}
        icon={Users}
      />
      
      {/* Separator Line */}
      <div className={`
        ${layout === 'horizontal' ? 'w-px h-12 bg-blue-200' : 'h-px w-16 bg-blue-200'}
        self-center
      `}></div>
      
      <StatItem
        type="following"
        count={stats.following_count}
        label="Following"
        icon={UserCheck}
      />
    </div>
  )
}
