import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  AdvancedAnalyticsSummary, 
  SearchInsights, 
  RealTimeStats, 
  AnalyticsEvent,
  AnalyticsEventType,
  advancedAnalyticsService 
} from '../services/advancedAnalytics'
import { analyticsWebSocketService } from '../services/analyticsWebSocket'
import { useWebSocketConfig } from '../services/webSocketConfig'

/**
 * Hook for managing analytics dashboard data
 */
export function useAnalyticsDashboard(timePeriod: '1d' | '7d' | '30d' = '7d') {
  const [data, setData] = useState<AdvancedAnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const analytics = await advancedAnalyticsService.getDashboardAnalytics(timePeriod)
      setData(analytics)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }, [timePeriod])

  const refresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  const clearCache = useCallback(async () => {
    try {
      await advancedAnalyticsService.clearCache()
      await fetchData() // Refresh data after clearing cache
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cache')
    }
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    clearCache
  }
}

/**
 * Hook for managing search insights
 */
export function useSearchInsights(timePeriod: '1d' | '7d' | '30d' = '7d') {
  const [insights, setInsights] = useState<SearchInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await advancedAnalyticsService.getSearchInsights(timePeriod)
      setInsights(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch search insights')
    } finally {
      setLoading(false)
    }
  }, [timePeriod])

  useEffect(() => {
    fetchInsights()
  }, [fetchInsights])

  return {
    insights,
    loading,
    error,
    refresh: fetchInsights
  }
}

/**
 * Hook for real-time analytics WebSocket connection
 */
export function useAnalyticsWebSocket(
  analyticsTypes: AnalyticsEventType[] = ['platform_metrics', 'search_trends', 'user_activity'],
  autoConnect: boolean = true
) {
  const [isConnected, setIsConnected] = useState(false)
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const subscriptionId = useRef(`analytics_${Date.now()}_${Math.random()}`)
  
  // Check WebSocket configuration
  const { config } = useWebSocketConfig()

  const handleAnalyticsEvent = useCallback((event: AnalyticsEvent) => {
    setEvents(prev => [...prev.slice(-49), event]) // Keep last 50 events
  }, [])

  const handleConnectionChange = useCallback((connected: boolean) => {
    setIsConnected(connected)
    setConnectionStatus(connected ? 'connected' : 'disconnected')
  }, [])

  const connect = useCallback(async () => {
    // Check if WebSocket is enabled and analytics feature is enabled
    if (!config.enabled || !config.features.analytics) {
      console.log('Analytics WebSocket disabled by configuration')
      setConnectionStatus('disconnected')
      return
    }

    try {
      setConnectionStatus('connecting')
      await analyticsWebSocketService.connect()
      
      // Subscribe to analytics events
      analyticsWebSocketService.subscribe(
        subscriptionId.current,
        analyticsTypes,
        handleAnalyticsEvent
      )
    } catch (error) {
      console.error('Failed to connect to analytics WebSocket:', error)
      setConnectionStatus('disconnected')
    }
  }, [analyticsTypes, handleAnalyticsEvent, config.enabled, config.features.analytics])

  const disconnect = useCallback(() => {
    analyticsWebSocketService.unsubscribe(subscriptionId.current)
    analyticsWebSocketService.disconnect()
    setConnectionStatus('disconnected')
  }, [])

  const clearEvents = useCallback(() => {
    setEvents([])
  }, [])

  const getCurrentMetrics = useCallback(() => {
    analyticsWebSocketService.getCurrentMetrics()
  }, [])

  const ping = useCallback(() => {
    analyticsWebSocketService.ping()
  }, [])

  useEffect(() => {
    // Add connection listener
    analyticsWebSocketService.addConnectionListener(handleConnectionChange)

    // Auto-connect only if enabled and analytics feature is enabled
    if (autoConnect && config.enabled && config.features.analytics) {
      connect()
    }

    return () => {
      // Cleanup
      analyticsWebSocketService.removeConnectionListener(handleConnectionChange)
      analyticsWebSocketService.unsubscribe(subscriptionId.current)
    }
  }, [autoConnect, connect, handleConnectionChange, config.enabled, config.features.analytics])

  return {
    isConnected,
    connectionStatus,
    events,
    connect,
    disconnect,
    clearEvents,
    getCurrentMetrics,
    ping
  }
}

/**
 * Hook for real-time statistics
 */
export function useRealTimeStats(refreshInterval: number = 30000) {
  const [stats, setStats] = useState<RealTimeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<number | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setError(null)
      const data = await advancedAnalyticsService.getRealTimeStats()
      setStats(data)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch real-time stats')
      setLoading(false)
    }
  }, [])

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    intervalRef.current = setInterval(fetchStats, refreshInterval)
  }, [fetchStats, refreshInterval])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    fetchStats() // Initial fetch
    startPolling()

    return () => {
      stopPolling()
    }
  }, [fetchStats, startPolling, stopPolling])

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
    startPolling,
    stopPolling
  }
}

/**
 * Hook for analytics monitoring controls
 */
export function useAnalyticsMonitoring() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [monitoringStats, setMonitoringStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startMonitoring = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      await advancedAnalyticsService.startMonitoring()
      setIsMonitoring(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start monitoring')
    } finally {
      setLoading(false)
    }
  }, [])

  const stopMonitoring = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      await advancedAnalyticsService.stopMonitoring()
      setIsMonitoring(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop monitoring')
    } finally {
      setLoading(false)
    }
  }, [])

  const getStats = useCallback(async () => {
    try {
      setError(null)
      const stats = await advancedAnalyticsService.getMonitoringStats()
      setMonitoringStats(stats.data)
      setIsMonitoring(stats.data?.analytics_monitoring?.monitoring_active || false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch monitoring stats')
    }
  }, [])

  const testBroadcast = useCallback(async (eventType: string, message: string) => {
    try {
      setError(null)
      await advancedAnalyticsService.testBroadcast(eventType, message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send test broadcast')
    }
  }, [])

  useEffect(() => {
    getStats() // Get initial stats
  }, [getStats])

  return {
    isMonitoring,
    monitoringStats,
    loading,
    error,
    startMonitoring,
    stopMonitoring,
    getStats,
    testBroadcast
  }
}

/**
 * Hook for analytics health monitoring
 */
export function useAnalyticsHealth() {
  const [health, setHealth] = useState<any>(null)
  const [isHealthy, setIsHealthy] = useState(true)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const checkHealth = useCallback(async () => {
    try {
      const healthData = await advancedAnalyticsService.checkHealth()
      setHealth(healthData)
      setIsHealthy(healthData.status === 'healthy')
      setLastCheck(new Date())
    } catch (err) {
      setHealth({ status: 'error', error: err instanceof Error ? err.message : 'Health check failed' })
      setIsHealthy(false)
      setLastCheck(new Date())
    }
  }, [])

  useEffect(() => {
    checkHealth()
    
    // Check health every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [checkHealth])

  return {
    health,
    isHealthy,
    lastCheck,
    checkHealth
  }
}
