/**
 * Real-time Search Status Component
 * Shows connection status and real-time update indicators
 */

import React from 'react';
import { ConnectionStatus } from '../services/websocket';
import { useWebSocketHealth } from '../hooks/useWebSocketSearch';

interface RealTimeSearchStatusProps {
  className?: string;
  showStats?: boolean;
}

export const RealTimeSearchStatus: React.FC<RealTimeSearchStatusProps> = ({
  className = "",
  showStats = false
}) => {
  const { isHealthy, connectionStatus, stats, lastUpdate, reconnect } = useWebSocketHealth();

  const getStatusColor = () => {
    switch (connectionStatus) {
      case ConnectionStatus.CONNECTED:
        return 'text-green-500';
      case ConnectionStatus.CONNECTING:
      case ConnectionStatus.RECONNECTING:
        return 'text-yellow-500';
      case ConnectionStatus.ERROR:
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case ConnectionStatus.CONNECTED:
        return (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            Live
          </div>
        );
      case ConnectionStatus.CONNECTING:
      case ConnectionStatus.RECONNECTING:
        return (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-spin mr-2"></div>
            Connecting...
          </div>
        );
      case ConnectionStatus.ERROR:
        return (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            Error
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
            Offline
          </div>
        );
    }
  };

  return (
    <div className={`flex items-center text-xs ${className}`}>
      <div className={`flex items-center ${getStatusColor()}`}>
        {getStatusIcon()}
      </div>
      
      {connectionStatus === ConnectionStatus.ERROR && (
        <button
          onClick={reconnect}
          className="ml-2 text-blue-500 hover:text-blue-700 underline"
        >
          Retry
        </button>
      )}

      {showStats && stats && isHealthy && (
        <div className="ml-4 text-gray-500 flex items-center space-x-2">
          <span>{stats.total_connections} connected</span>
          <span>•</span>
          <span>{stats.total_subscriptions} subscriptions</span>
          {lastUpdate && (
            <>
              <span>•</span>
              <span>Updated {Math.round((Date.now() - lastUpdate.getTime()) / 1000)}s ago</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RealTimeSearchStatus;
