/**
 * React hook for real-time search updates via WebSocket
 * Provides easy integration with React components
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  webSocketSearchService, 
  SearchSubscription, 
  SearchUpdateEvent, 
  ConnectionStatus,
  ConnectionStats 
} from '../services/websocket';
import { useWebSocketConfig } from '../services/webSocketConfig';

export interface UseWebSocketSearchOptions {
  autoConnect?: boolean;
  token?: string;
  reconnectOnError?: boolean;
}

export interface UseWebSocketSearchReturn {
  // Connection state
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  isConnecting: boolean;
  connectionStats: ConnectionStats | null;
  
  // Connection management
  connect: () => Promise<void>;
  disconnect: () => void;
  
  // Subscription management
  subscribe: (subscription: Omit<SearchSubscription, 'id'>) => string | null;
  unsubscribe: (subscriptionId: string) => boolean;
  subscriptions: SearchSubscription[];
  
  // Real-time updates
  searchUpdates: SearchUpdateEvent[];
  clearUpdates: () => void;
  
  // Error handling
  error: Error | null;
  clearError: () => void;
}

export function useWebSocketSearch(options: UseWebSocketSearchOptions = {}): UseWebSocketSearchReturn {
  const {
    autoConnect = true,
    token,
    reconnectOnError = true
  } = options;

  // Check WebSocket configuration
  const { config } = useWebSocketConfig();

  // State
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    webSocketSearchService.getConnectionStatus()
  );
  const [connectionStats, setConnectionStats] = useState<ConnectionStats | null>(null);
  const [subscriptions, setSubscriptions] = useState<SearchSubscription[]>([]);
  const [searchUpdates, setSearchUpdates] = useState<SearchUpdateEvent[]>([]);
  const [error, setError] = useState<Error | null>(null);

  // Refs for stable callbacks
  const subscriptionCallbacks = useRef<Map<string, (event: SearchUpdateEvent) => void>>(new Map());

  // Derived state
  const isConnected = connectionStatus === ConnectionStatus.CONNECTED;
  const isConnecting = connectionStatus === ConnectionStatus.CONNECTING;

  // Connection management
  const connect = useCallback(async () => {
    // Check if WebSocket is enabled and search feature is enabled
    if (!config.enabled || !config.features.search) {
      console.log('Search WebSocket disabled by configuration');
      return;
    }

    try {
      await webSocketSearchService.connect(token);
    } catch (err) {
      setError(err as Error);
    }
  }, [token, config.enabled, config.features.search]);

  const disconnect = useCallback(() => {
    webSocketSearchService.disconnect();
  }, []);

  // Subscription management
  const subscribe = useCallback((
    subscriptionData: Omit<SearchSubscription, 'id'>
  ): string | null => {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create update handler
    const onUpdate = (event: SearchUpdateEvent) => {
      setSearchUpdates(prev => {
        // Limit to last 100 updates to prevent memory issues
        const newUpdates = [event, ...prev].slice(0, 100);
        return newUpdates;
      });
    };

    const subscription: SearchSubscription = {
      ...subscriptionData,
      id: subscriptionId,
      onUpdate
    };

    // Store callback for cleanup
    subscriptionCallbacks.current.set(subscriptionId, onUpdate);

    // Subscribe via WebSocket service
    const success = webSocketSearchService.subscribe(subscription);
    
    if (success) {
      setSubscriptions(prev => [...prev, subscription]);
      return subscriptionId;
    }

    return null;
  }, []);

  const unsubscribe = useCallback((subscriptionId: string): boolean => {
    const success = webSocketSearchService.unsubscribe(subscriptionId);
    
    if (success) {
      setSubscriptions(prev => prev.filter(sub => sub.id !== subscriptionId));
      subscriptionCallbacks.current.delete(subscriptionId);
    }

    return success;
  }, []);

  // Update management
  const clearUpdates = useCallback(() => {
    setSearchUpdates([]);
  }, []);

  // Error management
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get stats periodically
  const refreshStats = useCallback(async () => {
    if (isConnected) {
      try {
        const stats = await webSocketSearchService.getStats();
        setConnectionStats(stats);
      } catch (err) {
        console.warn('Failed to get connection stats:', err);
      }
    }
  }, [isConnected]);

  // Set up event listeners
  useEffect(() => {
    const handleConnectionStatusChanged = (status: ConnectionStatus) => {
      setConnectionStatus(status);
      
      if (status === ConnectionStatus.CONNECTED) {
        setError(null);
        refreshStats();
      }
    };

    const handleError = (err: Error) => {
      setError(err);
      
      if (reconnectOnError && !isConnected) {
        // Attempt to reconnect after a delay
        setTimeout(() => {
          connect().catch(console.error);
        }, 2000);
      }
    };

    const handleSearchUpdate = (event: SearchUpdateEvent) => {
      // Global updates are handled by individual subscription callbacks
      // This is just for debugging or global event tracking
      console.log('Global search update:', event);
    };

    // Register event listeners
    webSocketSearchService.on('connectionStatusChanged', handleConnectionStatusChanged);
    webSocketSearchService.on('error', handleError);
    webSocketSearchService.on('searchUpdate', handleSearchUpdate);

    return () => {
      webSocketSearchService.off('connectionStatusChanged', handleConnectionStatusChanged);
      webSocketSearchService.off('error', handleError);
      webSocketSearchService.off('searchUpdate', handleSearchUpdate);
    };
  }, [connect, isConnected, reconnectOnError, refreshStats]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && 
        connectionStatus === ConnectionStatus.DISCONNECTED &&
        config.enabled && 
        config.features.search) {
      connect().catch(console.error);
    }
  }, [autoConnect, connect, connectionStatus, config.enabled, config.features.search]);

  // Refresh stats periodically
  useEffect(() => {
    let interval: number | null = null;

    if (isConnected) {
      interval = window.setInterval(() => {
        refreshStats().catch(console.error);
      }, 30000); // Every 30 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isConnected, refreshStats]);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      // Unsubscribe from all active subscriptions
      subscriptions.forEach(sub => {
        webSocketSearchService.unsubscribe(sub.id);
      });
      subscriptionCallbacks.current.clear();
    };
  }, []); // Empty dependency array is intentional - only run on unmount

  return {
    // Connection state
    connectionStatus,
    isConnected,
    isConnecting,
    connectionStats,
    
    // Connection management
    connect,
    disconnect,
    
    // Subscription management
    subscribe,
    unsubscribe,
    subscriptions,
    
    // Real-time updates
    searchUpdates,
    clearUpdates,
    
    // Error handling
    error,
    clearError
  };
}

/**
 * Hook for subscribing to specific search queries
 */
export function useSearchSubscription(
  query: string,
  entityTypes: ('user' | 'post' | 'representative')[] = ['user', 'post', 'representative'],
  enabled: boolean = true
): {
  updates: SearchUpdateEvent[];
  isSubscribed: boolean;
  error: Error | null;
} {
  const { subscribe, unsubscribe, isConnected } = useWebSocketSearch({ autoConnect: true });
  const [updates, setUpdates] = useState<SearchUpdateEvent[]>([]);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Subscribe/unsubscribe when query or connection status changes
  useEffect(() => {
    if (!enabled || !query.trim() || !isConnected) {
      if (subscriptionId) {
        unsubscribe(subscriptionId);
        setSubscriptionId(null);
      }
      return;
    }

    // Create subscription with custom update handler
    const newSubscriptionId = subscribe({
      query: query.trim(),
      entityTypes,
      onUpdate: (event: SearchUpdateEvent) => {
        setUpdates(prev => {
          // Add new update and keep last 50 updates per subscription
          const newUpdates = [event, ...prev].slice(0, 50);
          return newUpdates;
        });
      }
    });

    if (newSubscriptionId) {
      setSubscriptionId(newSubscriptionId);
      setError(null);
    } else {
      setError(new Error('Failed to create search subscription'));
    }

    // Cleanup previous subscription
    return () => {
      if (newSubscriptionId) {
        unsubscribe(newSubscriptionId);
      }
    };
  }, [query, entityTypes, enabled, isConnected, subscribe, unsubscribe]);

  return {
    updates,
    isSubscribed: !!subscriptionId,
    error
  };
}

/**
 * Hook for monitoring WebSocket connection health
 */
export function useWebSocketHealth(): {
  isHealthy: boolean;
  connectionStatus: ConnectionStatus;
  stats: ConnectionStats | null;
  lastUpdate: Date | null;
  reconnect: () => Promise<void>;
} {
  const { connectionStatus, connectionStats, connect } = useWebSocketSearch({ autoConnect: true });
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Track when we last received an update
  useEffect(() => {
    const handleUpdate = () => {
      setLastUpdate(new Date());
    };

    webSocketSearchService.on('searchUpdate', handleUpdate);
    return () => {
      webSocketSearchService.off('searchUpdate', handleUpdate);
    };
  }, []);

  const isHealthy = connectionStatus === ConnectionStatus.CONNECTED;

  return {
    isHealthy,
    connectionStatus,
    stats: connectionStats,
    lastUpdate,
    reconnect: connect
  };
}

export default useWebSocketSearch;
