import { BACKEND_URL } from '../config/api'
import { webSocketConfigService } from './webSocketConfig'
import { authManager } from './authManager'
import { ConnectionStatus } from './websocket'

export interface WebSocketNotificationEnvelope {
  type: string
  data: Record<string, any>
  message_id: string
  timestamp: number
  target_users?: string[] | null
  target_connections?: string[] | null
}

type EventCallback<T = any> = (payload: T) => void

type EventName =
  | 'notification'
  | 'connectionStatusChanged'
  | 'error'
  | 'rawMessage'

class SimpleEmitter {
  private listeners: Map<EventName, Set<EventCallback>> = new Map()

  on<T = any>(event: EventName, callback: EventCallback<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback as EventCallback)
  }

  off<T = any>(event: EventName, callback: EventCallback<T>): void {
    this.listeners.get(event)?.delete(callback as EventCallback)
  }

  emit<T = any>(event: EventName, payload: T): void {
    const callbacks = this.listeners.get(event)
    if (!callbacks) return
    callbacks.forEach(cb => {
      try {
        cb(payload)
      } catch (error) {
        console.error('[NotificationsWS] listener error', error)
      }
    })
  }
}

class NotificationWebSocketService extends SimpleEmitter {
  private ws: WebSocket | null = null
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED
  private token: string | null = null
  private reconnectAttempts = 0
  private reconnectTimer: number | null = null
  private heartbeatTimer: number | null = null
  private readonly heartbeatInterval = 30000
  private readonly maxReconnectDelay = 30000
  private readonly baseWsUrl: string

  constructor() {
    super()

    const envWsUrl = (import.meta as any).env?.VITE_WEBSOCKET_URL as string | undefined
    if (envWsUrl) {
      this.baseWsUrl = envWsUrl.replace(/\/$/, '')
    } else {
      const host = BACKEND_URL.replace(/\/$/, '')
      this.baseWsUrl = host.replace(/^http/, 'ws')
    }
  }

  getConnectionStatus(): ConnectionStatus {
    return this.status
  }

  async connect(token?: string): Promise<void> {
    const config = webSocketConfigService.getConfig()
    if (!config.enabled || !config.features.notifications) {
      console.debug('[NotificationsWS] websocket disabled by config')
      return
    }

    const nextToken = token ?? authManager.getAccessToken()
    if (!nextToken) {
      console.debug('[NotificationsWS] cannot connect without auth token')
      return
    }

    // Avoid duplicate connections when already active with same token
    if (this.ws && this.status === ConnectionStatus.CONNECTED && this.token === nextToken) {
      return
    }

    this.token = nextToken

    // Clean up existing connection first
    if (this.ws) {
      this.disconnect()
    }

    const url = `${this.baseWsUrl}/api/v1/ws?token=${encodeURIComponent(this.token)}&type=notifications`

    try {
      this.updateStatus(ConnectionStatus.CONNECTING)
      this.ws = new WebSocket(url)
      this.ws.onopen = () => this.handleOpen()
      this.ws.onmessage = event => this.handleMessage(event)
      this.ws.onerror = event => this.handleError(event)
      this.ws.onclose = event => this.handleClose(event)
    } catch (error) {
      console.error('[NotificationsWS] failed to open connection', error)
      this.scheduleReconnect()
      this.updateStatus(ConnectionStatus.ERROR)
    }
  }

  disconnect(): void {
    this.clearHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      try {
        this.ws.onopen = null
        this.ws.onmessage = null
        this.ws.onerror = null
        this.ws.onclose = null
        this.ws.close(1000, 'client_disconnect')
      } catch (error) {
        console.warn('[NotificationsWS] error closing socket', error)
      }
      this.ws = null
    }

    this.updateStatus(ConnectionStatus.DISCONNECTED)
    this.reconnectAttempts = 0
  }

  private handleOpen(): void {
    console.debug('[NotificationsWS] connected')
    this.updateStatus(ConnectionStatus.CONNECTED)
    this.reconnectAttempts = 0
    this.startHeartbeat()
  }

  private handleMessage(event: MessageEvent): void {
    try {
      if (typeof event.data !== 'string') {
        console.warn('[NotificationsWS] received non-text message, ignoring')
        return
      }

      const data = JSON.parse(event.data) as WebSocketNotificationEnvelope
      this.emit('rawMessage', data)

      switch (data.type) {
        case 'notification':
        case 'post_created':
        case 'post_updated':
        case 'post_deleted':
        case 'comment_created':
        case 'analytics_update':
        case 'custom':
          this.emit('notification', data)
          break
        case 'heartbeat':
        case 'auth_success':
        case 'user_joined':
        case 'user_left':
          // informational events only
          break
        default:
          console.debug('[NotificationsWS] unhandled message type', data.type)
      }
    } catch (error) {
      console.error('[NotificationsWS] failed to parse message', error)
      this.emit('error', error)
    }
  }

  private handleError(event: Event): void {
    console.error('[NotificationsWS] socket error', event)
    this.emit('error', new Error('WebSocket connection error'))
    this.updateStatus(ConnectionStatus.ERROR)
  }

  private handleClose(event: CloseEvent): void {
    console.debug('[NotificationsWS] socket closed', event.code, event.reason)
    this.clearHeartbeat()
    if (event.code !== 1000) {
      this.scheduleReconnect()
      this.updateStatus(ConnectionStatus.RECONNECTING)
    } else {
      this.updateStatus(ConnectionStatus.DISCONNECTED)
    }
  }

  private startHeartbeat(): void {
    this.clearHeartbeat()
    this.heartbeatTimer = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const payload = JSON.stringify({ type: 'heartbeat', data: { client_time: Date.now() } })
        try {
          this.ws.send(payload)
        } catch (error) {
          console.warn('[NotificationsWS] failed to send heartbeat', error)
        }
      }
    }, this.heartbeatInterval)
  }

  private clearHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer || !this.token) {
      return
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), this.maxReconnectDelay)
    this.reconnectAttempts += 1

    console.debug('[NotificationsWS] scheduling reconnect in', delay, 'ms')
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null
      this.connect(this.token ?? undefined)
    }, delay)
  }

  private updateStatus(status: ConnectionStatus): void {
    this.status = status
    this.emit('connectionStatusChanged', status)
  }
}

export const notificationWebSocketService = new NotificationWebSocketService()

export type { NotificationWebSocketService }
