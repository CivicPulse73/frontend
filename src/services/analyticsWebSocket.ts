import { AnalyticsEvent, AnalyticsEventType } from './advancedAnalytics'

interface AnalyticsSubscription {
  callback: (event: AnalyticsEvent) => void
  analyticsTypes: AnalyticsEventType[]
}

class AnalyticsWebSocketService {
  private ws: WebSocket | null = null
  private subscriptions: Map<string, AnalyticsSubscription> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 1000
  private isConnecting = false
  private connectionListeners: Set<(connected: boolean) => void> = new Set()

  constructor() {
    this.connect = this.connect.bind(this)
    this.handleMessage = this.handleMessage.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleError = this.handleError.bind(this)
  }

  /**
   * Connect to analytics WebSocket
   */
  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return
    }

    this.isConnecting = true

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/api/v1/ws/analytics`
      
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = () => {
        console.log('Analytics WebSocket connected')
        this.isConnecting = false
        this.reconnectAttempts = 0
        this.notifyConnectionListeners(true)
      }

      this.ws.onmessage = this.handleMessage
      this.ws.onclose = this.handleClose
      this.ws.onerror = this.handleError

    } catch (error) {
      console.error('Failed to connect to analytics WebSocket:', error)
      this.isConnecting = false
      this.scheduleReconnect()
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect')
      this.ws = null
    }
    this.notifyConnectionListeners(false)
  }

  /**
   * Subscribe to analytics events
   */
  subscribe(
    id: string, 
    analyticsTypes: AnalyticsEventType[], 
    callback: (event: AnalyticsEvent) => void
  ): void {
    // Store subscription
    this.subscriptions.set(id, { callback, analyticsTypes })

    // Send subscription message if connected
    if (this.isConnected()) {
      this.sendMessage({
        action: 'subscribe',
        analytics_types: analyticsTypes
      })
    }
  }

  /**
   * Unsubscribe from analytics events
   */
  unsubscribe(id: string): void {
    const subscription = this.subscriptions.get(id)
    if (subscription) {
      // Send unsubscription message if connected
      if (this.isConnected()) {
        this.sendMessage({
          action: 'unsubscribe',
          analytics_types: subscription.analyticsTypes
        })
      }
      
      this.subscriptions.delete(id)
    }
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): void {
    if (this.isConnected()) {
      this.sendMessage({
        action: 'get_current_metrics'
      })
    }
  }

  /**
   * Send ping to check connection
   */
  ping(): void {
    if (this.isConnected()) {
      this.sendMessage({
        action: 'ping'
      })
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  /**
   * Add connection status listener
   */
  addConnectionListener(listener: (connected: boolean) => void): void {
    this.connectionListeners.add(listener)
  }

  /**
   * Remove connection status listener
   */
  removeConnectionListener(listener: (connected: boolean) => void): void {
    this.connectionListeners.delete(listener)
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data)
      
      switch (message.event_type) {
        case 'connection_established':
          console.log('Analytics WebSocket connection established:', message.connection_id)
          // Re-subscribe to all active subscriptions
          this.resubscribeAll()
          break

        case 'analytics_update':
          this.handleAnalyticsUpdate(message)
          break

        case 'subscription_confirmed':
          console.log('Analytics subscription confirmed:', message.analytics_types)
          break

        case 'unsubscription_confirmed':
          console.log('Analytics unsubscription confirmed:', message.analytics_types)
          break

        case 'pong':
          console.log('Analytics WebSocket pong received with stats:', message.analytics_stats)
          break

        case 'current_metrics':
          console.log('Current metrics received:', message.data)
          // Broadcast to all subscribers
          this.broadcastToSubscribers({
            event_type: 'analytics_update',
            analytics_type: 'platform_metrics',
            data: message.data,
            timestamp: message.timestamp
          })
          break

        case 'error':
          console.error('Analytics WebSocket error:', message.error)
          break

        default:
          console.log('Unknown analytics message type:', message.event_type)
      }
    } catch (error) {
      console.error('Failed to parse analytics WebSocket message:', error)
    }
  }

  /**
   * Handle analytics update events
   */
  private handleAnalyticsUpdate(message: AnalyticsEvent): void {
    this.broadcastToSubscribers(message)
  }

  /**
   * Broadcast event to relevant subscribers
   */
  private broadcastToSubscribers(event: AnalyticsEvent): void {
    this.subscriptions.forEach((subscription) => {
      if (subscription.analyticsTypes.includes(event.analytics_type as AnalyticsEventType)) {
        try {
          subscription.callback(event)
        } catch (error) {
          console.error('Error in analytics subscription callback:', error)
        }
      }
    })
  }

  /**
   * Handle WebSocket close
   */
  private handleClose(event: CloseEvent): void {
    console.log('Analytics WebSocket closed:', event.code, event.reason)
    this.ws = null
    this.notifyConnectionListeners(false)
    
    // Only reconnect if it wasn't a manual close
    if (event.code !== 1000) {
      this.scheduleReconnect()
    }
  }

  /**
   * Handle WebSocket error
   */
  private handleError(event: Event): void {
    console.error('Analytics WebSocket error:', event)
    this.isConnecting = false
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max analytics WebSocket reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`Scheduling analytics WebSocket reconnection attempt ${this.reconnectAttempts} in ${delay}ms`)
    
    setTimeout(() => {
      if (!this.isConnected()) {
        this.connect()
      }
    }, delay)
  }

  /**
   * Re-subscribe to all active subscriptions
   */
  private resubscribeAll(): void {
    this.subscriptions.forEach((subscription, id) => {
      this.sendMessage({
        action: 'subscribe',
        analytics_types: subscription.analyticsTypes
      })
    })
  }

  /**
   * Send message to WebSocket
   */
  private sendMessage(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('Cannot send analytics message: WebSocket not connected')
    }
  }

  /**
   * Notify connection listeners
   */
  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach(listener => {
      try {
        listener(connected)
      } catch (error) {
        console.error('Error in connection listener:', error)
      }
    })
  }
}

// Export singleton instance
export const analyticsWebSocketService = new AnalyticsWebSocketService()
