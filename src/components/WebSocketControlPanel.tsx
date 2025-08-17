/**
 * WebSocket Control Panel
 * Admin component to enable/disable WebSocket features
 */

import React from 'react';
import { useWebSocketConfig } from '../services/webSocketConfig';

interface WebSocketControlPanelProps {
  className?: string;
  showAdvanced?: boolean;
}

export const WebSocketControlPanel: React.FC<WebSocketControlPanelProps> = ({
  className = "",
  showAdvanced = false
}) => {
  const {
    config,
    isEnabled,
    isFeatureEnabled,
    shouldUseFallback,
    shouldUsePolling,
    getPollingInterval,
    setEnabled,
    setFeatureEnabled,
    setMode,
    getStatusMessage
  } = useWebSocketConfig();

  const getStatusIcon = () => {
    if (isEnabled) {
      return '✅';
    } else if (shouldUseFallback) {
      return '⚠️';
    } else {
      return '❌';
    }
  };

  const getStatusColor = () => {
    if (isEnabled) return 'text-green-600';
    if (shouldUseFallback) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getStatusIcon()}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Real-time Features</h3>
            <p className={`text-sm ${getStatusColor()}`}>{getStatusMessage}</p>
          </div>
        </div>
        
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Mode Selection */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-3 block">
          Operation Mode
        </label>
        <div className="space-y-2">
          {[
            { value: 'enabled', label: 'Enabled', desc: 'Full WebSocket functionality' },
            { value: 'fallback', label: 'Fallback', desc: 'Try WebSocket, fall back to polling' },
            { value: 'disabled', label: 'Disabled', desc: 'Use REST API only' },
            { value: 'maintenance', label: 'Maintenance', desc: 'Temporarily disabled' }
          ].map((mode) => (
            <label key={mode.value} className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value={mode.value}
                checked={config.mode === mode.value}
                onChange={() => setMode(mode.value as any)}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{mode.label}</p>
                <p className="text-sm text-gray-500">{mode.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Feature Controls */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-3 block">
          Feature Controls
        </label>
        <div className="space-y-3">
          {[
            { key: 'search' as const, label: 'Real-time Search', desc: 'Live search result updates' },
            { key: 'analytics' as const, label: 'Live Analytics', desc: 'Real-time dashboard metrics' },
            { key: 'notifications' as const, label: 'Live Notifications', desc: 'Instant notifications' }
          ].map((feature) => (
            <div key={feature.key} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{feature.label}</p>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatureEnabled(feature.key)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFeatureEnabled(feature.key, e.target.checked)}
                  disabled={!isEnabled}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${
                  !isEnabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Fallback Information */}
      {!isEnabled && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <span className="text-blue-500 text-xl">⚠️</span>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-2">Fallback Mode Active</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Search: Manual refresh required</p>
                <p>• Analytics: {shouldUsePolling ? `Polling every ${getPollingInterval / 1000}s` : 'Manual refresh'}</p>
                <p>• Notifications: Disabled</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Advanced Settings</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Polling Enabled:</span>
              <span className="ml-2 font-medium">{shouldUsePolling ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-gray-500">Polling Interval:</span>
              <span className="ml-2 font-medium">{getPollingInterval / 1000}s</span>
            </div>
            <div>
              <span className="text-gray-500">Connection Timeout:</span>
              <span className="ml-2 font-medium">{config.connection.timeout / 1000}s</span>
            </div>
            <div>
              <span className="text-gray-500">Max Retries:</span>
              <span className="ml-2 font-medium">{config.connection.maxRetries}</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex space-x-3">
          <button
            onClick={() => setMode('enabled')}
            disabled={config.mode === 'enabled'}
            className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Enable All
          </button>
          <button
            onClick={() => setMode('disabled')}
            disabled={config.mode === 'disabled'}
            className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Disable All
          </button>
          <button
            onClick={() => setMode('fallback')}
            disabled={config.mode === 'fallback'}
            className="px-3 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Fallback Mode
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebSocketControlPanel;
