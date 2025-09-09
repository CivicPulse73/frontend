import React from 'react'
import { AccountStats, AccountStatsMetric } from '../types'

interface AccountStatsCardProps {
  stats: AccountStats
  loading?: boolean
  className?: string
}

interface MetricCardProps {
  metric: AccountStatsMetric
  className?: string
}

const MetricCard: React.FC<MetricCardProps> = ({ metric, className = '' }) => {
  const formatValue = (value: number | string, type: string): string => {
    if (typeof value === 'string') return value
    
    switch (type) {
      case 'percentage':
        return `${value}%`
      case 'number':
        return value.toLocaleString()
      default:
        return String(value)
    }
  }

  const getMetricIcon = (key: string): string => {
    const icons: Record<string, string> = {
      posts_count: '📝',
      comments_received: '💬',
      upvotes_received: '👍',
      total_views: '👁️',
      total_resolved_issues: '✅',
      resolution_rate: '📈',
      average_response_time: '⏱️',
      efficiency_score: '⚡',
      evotes_received: '🗳️'
    }
    return icons[key] || '📊'
  }

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getMetricIcon(metric.key)}</span>
          <span className="text-sm text-gray-600">{metric.label}</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {formatValue(metric.value, metric.type)}
          </div>
        </div>
      </div>
    </div>
  )
}

const AccountStatsCard: React.FC<AccountStatsCardProps> = ({ 
  stats, 
  loading = false, 
  className = '' 
}) => {
  if (loading) {
    return (
      <div className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4 w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-100 rounded-lg p-4">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-8 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const isRepresentative = stats.account_type === 'representative'

  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isRepresentative ? 'Representative Performance' : 'Account Statistics'}
        </h3>
        <p className="text-sm text-gray-600">
          {isRepresentative 
            ? 'Performance metrics and engagement data' 
            : 'Your activity and engagement overview'}
        </p>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.metrics.map((metric) => (
          <MetricCard 
            key={metric.key} 
            metric={metric}
          />
        ))}
      </div>

      {/* eVotes Section (Representative Only) */}
      {'evotes' in stats && stats.evotes && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🗳️</span>
            Electoral Support
          </h4>
          <div className="max-w-sm">
            <MetricCard 
              metric={stats.evotes}
              className="border-indigo-200 bg-indigo-50"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountStatsCard
