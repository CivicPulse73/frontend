/**
 * WebSocket Test Page
 * Demonstrates WebSocket disable functionality with live status updates
 */

import React, { useState, useEffect } from 'react';
import WebSocketControlPanel from '../components/WebSocketControlPanel';
import { useWebSocketConfig } from '../services/webSocketConfig';

const WebSocketTestPage: React.FC = () => {
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [analyticsData, setAnalyticsData] = useState({ views: 0, users: 0 });
  const [notifications, setNotifications] = useState<string[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('Never');
  
  const {
    isEnabled,
    isFeatureEnabled,
    shouldUsePolling,
    getPollingInterval
  } = useWebSocketConfig();

  // Simulate data updates
  useEffect(() => {
    if (!isEnabled) {
      // Manual refresh mode - no automatic updates
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString();
      setLastUpdate(now);

      // Update search results if feature is enabled
      if (isFeatureEnabled('search')) {
        setSearchResults(prev => [
          `Search result ${Math.floor(Math.random() * 1000)} (${now})`,
          ...prev.slice(0, 4)
        ]);
      }

      // Update analytics if feature is enabled
      if (isFeatureEnabled('analytics')) {
        setAnalyticsData(prev => ({
          views: prev.views + Math.floor(Math.random() * 10),
          users: prev.users + Math.floor(Math.random() * 3)
        }));
      }

      // Add notifications if feature is enabled
      if (isFeatureEnabled('notifications')) {
        setNotifications(prev => [
          `New notification at ${now}`,
          ...prev.slice(0, 2)
        ]);
      }
    }, shouldUsePolling ? getPollingInterval : 2000);

    return () => clearInterval(interval);
  }, [isEnabled, isFeatureEnabled, shouldUsePolling, getPollingInterval]);

  const manualRefresh = () => {
    const now = new Date().toLocaleTimeString();
    setLastUpdate(now);
    
    // Simulate manual data fetch
    setSearchResults([
      `Manual search result ${Math.floor(Math.random() * 1000)} (${now})`,
      ...searchResults.slice(0, 4)
    ]);
    
    setAnalyticsData(prev => ({
      views: prev.views + Math.floor(Math.random() * 50),
      users: prev.users + Math.floor(Math.random() * 10)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            WebSocket Configuration Demo
          </h1>
          <p className="text-gray-600">
            Test the WebSocket disable functionality and see how the system gracefully falls back to manual refresh or polling modes.
          </p>
        </div>

        {/* Control Panel */}
        <WebSocketControlPanel showAdvanced={true} />

        {/* Demo Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Real-time Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                isFeatureEnabled('search') && isEnabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {isFeatureEnabled('search') && isEnabled ? 'Live' : 'Manual'}
              </span>
            </div>
            
            {!isEnabled && (
              <div className="mb-4">
                <button
                  onClick={manualRefresh}
                  className="w-full px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                >
                  Refresh Search Results
                </button>
              </div>
            )}
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {searchResults.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No search results yet</p>
              ) : (
                searchResults.map((result, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                    {result}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Analytics Dashboard */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                isFeatureEnabled('analytics') && isEnabled 
                  ? 'bg-green-100 text-green-800' 
                  : shouldUsePolling 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
              }`}>
                {isFeatureEnabled('analytics') && isEnabled 
                  ? 'Live' 
                  : shouldUsePolling 
                    ? 'Polling'
                    : 'Manual'
                }
              </span>
            </div>
            
            {!isEnabled && !shouldUsePolling && (
              <div className="mb-4">
                <button
                  onClick={manualRefresh}
                  className="w-full px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                >
                  Refresh Analytics
                </button>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-900">{analyticsData.views.toLocaleString()}</div>
                <div className="text-sm text-blue-700">Page Views</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-900">{analyticsData.users.toLocaleString()}</div>
                <div className="text-sm text-green-700">Active Users</div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                isFeatureEnabled('notifications') && isEnabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isFeatureEnabled('notifications') && isEnabled ? 'Active' : 'Disabled'}
              </span>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {!isFeatureEnabled('notifications') || !isEnabled ? (
                <p className="text-gray-500 text-sm italic">
                  Notifications are disabled when WebSocket is off
                </p>
              ) : notifications.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No notifications yet</p>
              ) : (
                notifications.map((notification, index) => (
                  <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    {notification}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-500">Last Update:</span>
              <span className="font-medium">{lastUpdate}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-500">WebSocket Status:</span>
              <span className={`font-medium ${
                isEnabled ? 'text-green-600' : 'text-red-600'
              }`}>
                {isEnabled ? 'Connected' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-500">Update Mode:</span>
              <span className="font-medium">
                {isEnabled 
                  ? 'Real-time' 
                  : shouldUsePolling 
                    ? `Polling (${getPollingInterval / 1000}s)`
                    : 'Manual'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebSocketTestPage;
