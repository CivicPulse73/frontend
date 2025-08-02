import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChartBarIcon,
  ClockIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  WifiIcon,
  SignalIcon,
  ArrowPathIcon,
  EyeIcon,
  FireIcon
} from '@heroicons/react/24/outline'
import { Card } from './UI'
import { 
  useAnalyticsDashboard, 
  useAnalyticsWebSocket, 
  useRealTimeStats,
  useAnalyticsMonitoring 
} from '../hooks/useAnalytics'
import { AdvancedAnalyticsSummary, AnalyticsEvent } from '../services/advancedAnalytics'

interface AnalyticsDashboardProps {
  className?: string
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className = '' }) => {
  const [timePeriod, setTimePeriod] = useState<'1d' | '7d' | '30d'>('7d')
  const [activeTab, setActiveTab] = useState<'overview' | 'search' | 'content' | 'realtime'>('overview')
  
  const { data, loading, error, lastUpdated, refresh, clearCache } = useAnalyticsDashboard(timePeriod)
  const { isConnected, events, connect, disconnect } = useAnalyticsWebSocket([
    'platform_metrics', 
    'search_trends', 
    'user_activity', 
    'system_alert'
  ])
  const { stats: realTimeStats } = useRealTimeStats()
  const { isMonitoring, startMonitoring, stopMonitoring } = useAnalyticsMonitoring()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <ArrowPathIcon className="h-6 w-6 animate-spin text-primary-600" />
          <span className="text-gray-600">Loading analytics...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex items-center space-x-3 text-red-600">
          <ExclamationTriangleIcon className="h-6 w-6" />
          <div>
            <h3 className="font-medium">Analytics Error</h3>
            <p className="text-sm text-red-500 mt-1">{error}</p>
            <button
              onClick={refresh}
              className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Platform insights and performance metrics
          </p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          {/* Real-time Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Live' : 'Offline'}
            </span>
            <WifiIcon className={`h-4 w-4 ${isConnected ? 'text-green-500' : 'text-gray-400'}`} />
          </div>

          {/* Time Period Selector */}
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as '1d' | '7d' | '30d')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={refresh}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh data"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'search', label: 'Search Analytics', icon: MagnifyingGlassIcon },
            { id: 'content', label: 'Content Performance', icon: DocumentTextIcon },
            { id: 'realtime', label: 'Real-time', icon: SignalIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } transition-colors`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && data && (
            <OverviewTab data={data} realTimeStats={realTimeStats} />
          )}
          
          {activeTab === 'search' && data && (
            <SearchAnalyticsTab searchData={data.search_analytics} />
          )}
          
          {activeTab === 'content' && data && (
            <ContentAnalyticsTab contentData={data.content_analytics} />
          )}
          
          {activeTab === 'realtime' && (
            <RealTimeTab 
              events={events}
              isConnected={isConnected}
              isMonitoring={isMonitoring}
              onStartMonitoring={startMonitoring}
              onStopMonitoring={stopMonitoring}
              onConnect={connect}
              onDisconnect={disconnect}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Last Updated Info */}
      {lastUpdated && (
        <div className="text-xs text-gray-500 text-right">
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}
    </div>
  )
}

// Overview Tab Component
const OverviewTab: React.FC<{ 
  data: AdvancedAnalyticsSummary
  realTimeStats: any 
}> = ({ data, realTimeStats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {/* Platform Metrics Cards */}
    <MetricCard
      title="Total Users"
      value={data.platform_metrics.total_users}
      change={data.platform_metrics.active_users_24h}
      changeLabel="active today"
      icon={UsersIcon}
      color="blue"
    />
    
    <MetricCard
      title="Total Posts"
      value={data.platform_metrics.total_posts}
      change={realTimeStats?.recent_posts || 0}
      changeLabel="in last hour"
      icon={DocumentTextIcon}
      color="green"
    />
    
    <MetricCard
      title="Search Volume"
      value={data.platform_metrics.total_searches}
      change={realTimeStats?.searches_last_hour || 0}
      changeLabel="in last hour"
      icon={MagnifyingGlassIcon}
      color="purple"
    />
    
    <MetricCard
      title="Engagement Rate"
      value={`${data.platform_metrics.engagement_rate}%`}
      change={data.platform_metrics.total_comments}
      changeLabel="total comments"
      icon={ChatBubbleLeftRightIcon}
      color="orange"
    />

    {/* Charts Section */}
    <div className="md:col-span-2 lg:col-span-4">
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Trends</h3>
        {/* Add chart components here */}
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500">
          Chart component will be added here
        </div>
      </Card>
    </div>
  </div>
)

// Search Analytics Tab Component
const SearchAnalyticsTab: React.FC<{ searchData: any }> = ({ searchData }) => (
  <div className="space-y-6">
    {/* Popular Queries */}
    <Card className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <FireIcon className="h-5 w-5 text-orange-500 mr-2" />
        Popular Search Queries
      </h3>
      <div className="space-y-3">
        {searchData.popular_queries.slice(0, 10).map((query: any, index: number) => (
          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div className="flex-1">
              <span className="font-medium text-gray-900">{query.query}</span>
              <div className="text-sm text-gray-500">
                {query.search_count} searches • {query.unique_users} unique users
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              {query.avg_results} avg results
            </div>
          </div>
        ))}
      </div>
    </Card>

    {/* Search Trends */}
    <Card className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Search Volume Trends</h3>
      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500">
        Search trends chart will be added here
      </div>
    </Card>
  </div>
)

// Content Analytics Tab Component  
const ContentAnalyticsTab: React.FC<{ contentData: any }> = ({ contentData }) => (
  <div className="space-y-6">
    {/* Trending Posts */}
    <Card className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <ArrowTrendingUpIcon className="h-5 w-5 text-green-500 mr-2" />
        Trending Posts
      </h3>
      <div className="space-y-4">
        {contentData.trending_posts.slice(0, 5).map((post: any) => (
          <div key={post.id} className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">{post.title}</h4>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>By {post.author} • {post.area}</span>
              <div className="flex items-center space-x-4">
                <span>{post.upvotes} upvotes</span>
                <span>{post.comment_count} comments</span>
                <span>{post.view_count} views</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>

    {/* Popular Areas */}
    <Card className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Areas</h3>
      <div className="space-y-3">
        {contentData.popular_areas.slice(0, 8).map((area: any, index: number) => (
          <div key={index} className="flex items-center justify-between">
            <span className="font-medium text-gray-900">{area.area}</span>
            <div className="text-sm text-gray-600">
              {area.post_count} posts • {area.total_upvotes} upvotes
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
)

// Real-time Tab Component
const RealTimeTab: React.FC<{
  events: AnalyticsEvent[]
  isConnected: boolean
  isMonitoring: boolean
  onStartMonitoring: () => void
  onStopMonitoring: () => void
  onConnect: () => void
  onDisconnect: () => void
}> = ({ events, isConnected, isMonitoring, onStartMonitoring, onStopMonitoring, onConnect, onDisconnect }) => (
  <div className="space-y-6">
    {/* Connection Controls */}
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Real-time Monitoring</h3>
          <p className="text-sm text-gray-600 mt-1">
            Live analytics events and platform monitoring
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={isConnected ? onDisconnect : onConnect}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              isConnected 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            } transition-colors`}
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </button>
          
          <button
            onClick={isMonitoring ? onStopMonitoring : onStartMonitoring}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              isMonitoring 
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            } transition-colors`}
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </button>
        </div>
      </div>
    </Card>

    {/* Real-time Events */}
    <Card className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Live Events</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <EyeIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No real-time events yet</p>
            <p className="text-sm">Events will appear here when connected</p>
          </div>
        ) : (
          events.slice().reverse().map((event, index) => (
            <motion.div
              key={`${event.timestamp}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className={`w-2 h-2 rounded-full mt-2 ${
                event.analytics_type === 'system_alert' ? 'bg-red-500' :
                event.analytics_type === 'user_activity' ? 'bg-blue-500' :
                event.analytics_type === 'search_trends' ? 'bg-purple-500' :
                'bg-green-500'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {event.analytics_type.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {JSON.stringify(event.data, null, 2).slice(0, 100)}...
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </Card>
  </div>
)

// Metric Card Component
const MetricCard: React.FC<{
  title: string
  value: string | number
  change?: string | number
  changeLabel?: string
  icon: React.ComponentType<any>
  color: 'blue' | 'green' | 'purple' | 'orange'
}> = ({ title, value, change, changeLabel, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100'
  }

  return (
    <Card className="p-6">
      <div className="flex items-center">
        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {change !== undefined && (
            <p className="text-xs text-gray-500">
              {change} {changeLabel}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
