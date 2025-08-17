import { FollowStats } from '../types'

interface CompactFollowStatsProps {
  stats: FollowStats
  onClick?: (type: 'followers' | 'following') => void
  className?: string
}

export default function CompactFollowStats({
  stats,
  onClick,
  className = ''
}: CompactFollowStatsProps) {
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  return (
    <div className={`flex items-center space-x-4 text-sm ${className}`}>
      <button
        onClick={() => onClick?.('followers')}
        className={`flex items-center space-x-1 ${
          onClick ? 'hover:text-blue-600 cursor-pointer' : 'cursor-default'
        } transition-colors`}
        disabled={!onClick}
      >
        <span className="font-semibold text-gray-900">
          {formatCount(stats.followers_count)}
        </span>
        <span className="text-gray-600">
          {stats.followers_count === 1 ? 'Follower' : 'Followers'}
        </span>
      </button>
      
      <button
        onClick={() => onClick?.('following')}
        className={`flex items-center space-x-1 ${
          onClick ? 'hover:text-blue-600 cursor-pointer' : 'cursor-default'
        } transition-colors`}
        disabled={!onClick}
      >
        <span className="font-semibold text-gray-900">
          {formatCount(stats.following_count)}
        </span>
        <span className="text-gray-600">Following</span>
      </button>
    </div>
  )
}
