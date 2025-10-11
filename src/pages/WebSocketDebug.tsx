import { useState, useEffect } from 'react'
import { webSocketConfigService } from '../services/webSocketConfig'
import { authManager } from '../services/authManager'
import { notificationWebSocketService } from '../services/notificationWebsocket'
import { ConnectionStatus } from '../services/websocket'

export default function WebSocketDebug() {
  const [config, setConfig] = useState(webSocketConfigService.getConfig())
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem('civic_user_data')
    return userData ? JSON.parse(userData) : null
  })
  const [connectionStatus, setConnectionStatus] = useState(ConnectionStatus.DISCONNECTED)
  const [manualConnectResult, setManualConnectResult] = useState('')

  useEffect(() => {
    setToken(authManager.getAccessToken())
    
    const handleConfigChange = (newConfig: typeof config) => {
      setConfig(newConfig)
    }
    
    const handleStatusChange = (status: ConnectionStatus) => {
      setConnectionStatus(status)
    }

    webSocketConfigService.addConfigListener(handleConfigChange)
    notificationWebSocketService.on('connectionStatusChanged', handleStatusChange)

    return () => {
      webSocketConfigService.removeConfigListener(handleConfigChange)
      notificationWebSocketService.off('connectionStatusChanged', handleStatusChange)
    }
  }, [])

  const handleManualConnect = async () => {
    try {
      setManualConnectResult('Attempting to connect...')
      await notificationWebSocketService.connect()
      setManualConnectResult('Connect method called successfully')
    } catch (error) {
      setManualConnectResult(`Error: ${error}`)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">WebSocket Debug Information</h1>
      
      <div className="space-y-6">
        {/* WebSocket Config */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">WebSocket Configuration</h2>
          <div className="space-y-2">
            <p><strong>Enabled:</strong> <span className={config.enabled ? 'text-green-600' : 'text-red-600'}>{config.enabled ? 'Yes' : 'No'}</span></p>
            <p><strong>Mode:</strong> {config.mode}</p>
            <p><strong>Notifications Feature:</strong> <span className={config.features.notifications ? 'text-green-600' : 'text-red-600'}>{config.features.notifications ? 'Enabled' : 'Disabled'}</span></p>
            <p><strong>Search Feature:</strong> {config.features.search ? 'Enabled' : 'Disabled'}</p>
            <p><strong>Analytics Feature:</strong> {config.features.analytics ? 'Enabled' : 'Disabled'}</p>
          </div>
        </div>

        {/* Auth Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>User Logged In:</strong> <span className={user ? 'text-green-600' : 'text-red-600'}>{user ? 'Yes' : 'No'}</span></p>
            {user && (
              <>
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
              </>
            )}
            <p><strong>Has Access Token:</strong> <span className={token ? 'text-green-600' : 'text-red-600'}>{token ? 'Yes' : 'No'}</span></p>
            {token && (
              <p className="text-xs text-gray-500 break-all"><strong>Token:</strong> {token.substring(0, 50)}...</p>
            )}
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">WebSocket Connection Status</h2>
          <div className="space-y-2">
            <p><strong>Current Status:</strong> <span className={
              connectionStatus === ConnectionStatus.CONNECTED ? 'text-green-600' :
              connectionStatus === ConnectionStatus.CONNECTING ? 'text-yellow-600' :
              connectionStatus === ConnectionStatus.ERROR ? 'text-red-600' :
              'text-gray-600'
            }>{connectionStatus}</span></p>
            <p><strong>Service Status:</strong> {notificationWebSocketService.getConnectionStatus()}</p>
          </div>
        </div>

        {/* Manual Connect Test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Manual Connection Test</h2>
          <button
            onClick={handleManualConnect}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Try Manual Connect
          </button>
          {manualConnectResult && (
            <p className="mt-2 text-sm">{manualConnectResult}</p>
          )}
        </div>

        {/* Environment Variables */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-1 text-sm">
            <p><strong>VITE_WEBSOCKET_ENABLED:</strong> {import.meta.env.VITE_WEBSOCKET_ENABLED}</p>
            <p><strong>VITE_WEBSOCKET_MODE:</strong> {import.meta.env.VITE_WEBSOCKET_MODE}</p>
            <p><strong>VITE_WEBSOCKET_URL:</strong> {import.meta.env.VITE_WEBSOCKET_URL}</p>
            <p><strong>VITE_WEBSOCKET_NOTIFICATIONS_ENABLED:</strong> {import.meta.env.VITE_WEBSOCKET_NOTIFICATIONS_ENABLED}</p>
          </div>
        </div>

        {/* Diagnostic Info */}
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h2 className="text-xl font-semibold mb-4">Diagnostic Checklist</h2>
          <ul className="space-y-2">
            <li className={config.enabled ? 'text-green-600' : 'text-red-600'}>
              {config.enabled ? '✓' : '✗'} WebSocket is enabled in config
            </li>
            <li className={config.features.notifications ? 'text-green-600' : 'text-red-600'}>
              {config.features.notifications ? '✓' : '✗'} Notifications feature is enabled
            </li>
            <li className={user ? 'text-green-600' : 'text-red-600'}>
              {user ? '✓' : '✗'} User is logged in
            </li>
            <li className={token ? 'text-green-600' : 'text-red-600'}>
              {token ? '✓' : '✗'} Access token is available
            </li>
            <li className={connectionStatus === ConnectionStatus.CONNECTED ? 'text-green-600' : 'text-red-600'}>
              {connectionStatus === ConnectionStatus.CONNECTED ? '✓' : '✗'} WebSocket is connected
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
