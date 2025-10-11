/**
 * WebSocket Configuration Service
 * Handles enabling/disabling WebSocket features with graceful fallback
 */

import { useState, useEffect } from 'react';

export interface WebSocketConfig {
  enabled: boolean;
  mode: 'enabled' | 'disabled' | 'fallback' | 'maintenance';
  features: {
    search: boolean;
    analytics: boolean;
    notifications: boolean;
  };
  polling: {
    enabled: boolean;
    interval: number; // seconds
  };
  connection: {
    timeout: number;
    maxRetries: number;
    retryDelay: number;
  };
}

export interface FallbackConfig {
  usePolling: boolean;
  pollingInterval: number;
  showWebSocketStatus: boolean;
  enableOfflineMode: boolean;
}

class WebSocketConfigService {
  private config: WebSocketConfig;
  private fallbackConfig: FallbackConfig;
  private configListeners: ((config: WebSocketConfig) => void)[] = [];

  constructor() {
    this.config = this.getDefaultConfig();
    this.fallbackConfig = this.getDefaultFallbackConfig();
    this.loadConfigFromEnvironment();
  }

  private getDefaultConfig(): WebSocketConfig {
    return {
      enabled: false,
      mode: 'disabled',
      features: {
        search: false,
        analytics: false,
        notifications: false,
      },
      polling: {
        enabled: true,
        interval: 30,
      },
      connection: {
        timeout: 30000,
        maxRetries: 5,
        retryDelay: 1000,
      },
    };
  }

  private getDefaultFallbackConfig(): FallbackConfig {
    return {
      usePolling: true,
      pollingInterval: 30000,
      showWebSocketStatus: true,
      enableOfflineMode: true,
    };
  }

  private loadConfigFromEnvironment() {
    // Load from environment variables or local storage
    const env = (import.meta as any).env || {};
    const readFlag = (primaryKey: string, fallbackKey?: string, defaultValue = true) => {
      const rawPrimary = env[primaryKey];
      if (typeof rawPrimary === 'string') {
        return rawPrimary !== 'false';
      }

      if (fallbackKey) {
        const rawFallback = env[fallbackKey];
        if (typeof rawFallback === 'string') {
          return rawFallback !== 'false';
        }
      }

      return defaultValue;
    };

    const envConfig = {
      enabled: readFlag('VITE_WEBSOCKET_ENABLED', 'VITE_WS_ENABLED'),
      mode: (env.VITE_WEBSOCKET_MODE as any) || env.VITE_WS_MODE || 'enabled',
      features: {
        search: readFlag('VITE_WS_SEARCH', 'VITE_WEBSOCKET_SEARCH_ENABLED', false),
        analytics: readFlag('VITE_WS_ANALYTICS', 'VITE_WEBSOCKET_ANALYTICS_ENABLED', false),
        notifications: readFlag('VITE_WS_NOTIFICATIONS', 'VITE_WEBSOCKET_NOTIFICATIONS_ENABLED'),
      },
    };

    this.config = { ...this.config, ...envConfig };
    
    // Check local storage for user preferences
    const userConfig = this.loadUserConfig();
    if (userConfig) {
      this.config = { ...this.config, ...userConfig };
    }
  }

  private loadUserConfig(): Partial<WebSocketConfig> | null {
    try {
      const stored = localStorage.getItem('civicpulse_websocket_config');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private saveUserConfig() {
    try {
      localStorage.setItem('civicpulse_websocket_config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save WebSocket config to localStorage:', error);
    }
  }

  // Public API
  public getConfig(): WebSocketConfig {
    return { ...this.config };
  }

  public getFallbackConfig(): FallbackConfig {
    return { ...this.fallbackConfig };
  }

  public isWebSocketEnabled(): boolean {
    return this.config.enabled && this.config.mode === 'enabled';
  }

  public isFeatureEnabled(feature: keyof WebSocketConfig['features']): boolean {
    if (!this.isWebSocketEnabled()) {
      return false;
    }
    return this.config.features[feature];
  }

  public shouldUseFallback(): boolean {
    return this.config.mode === 'fallback' || this.config.mode === 'disabled';
  }

  public shouldUsePolling(): boolean {
    return !this.isWebSocketEnabled() && this.config.polling.enabled;
  }

  public getPollingInterval(): number {
    return this.config.polling.interval * 1000; // Convert to milliseconds
  }

  public setWebSocketEnabled(enabled: boolean) {
    this.config.enabled = enabled;
    this.config.mode = enabled ? 'enabled' : 'disabled';
    this.notifyListeners();
    this.saveUserConfig();
  }

  public setFeatureEnabled(feature: keyof WebSocketConfig['features'], enabled: boolean) {
    this.config.features[feature] = enabled;
    this.notifyListeners();
    this.saveUserConfig();
  }

  public setMode(mode: WebSocketConfig['mode']) {
    this.config.mode = mode;
    this.config.enabled = mode === 'enabled' || mode === 'fallback';
    this.notifyListeners();
    this.saveUserConfig();
  }

  public enablePolling(interval?: number) {
    this.config.polling.enabled = true;
    if (interval) {
      this.config.polling.interval = interval;
    }
    this.notifyListeners();
    this.saveUserConfig();
  }

  public disablePolling() {
    this.config.polling.enabled = false;
    this.notifyListeners();
    this.saveUserConfig();
  }

  // Event listeners
  public addConfigListener(listener: (config: WebSocketConfig) => void) {
    this.configListeners.push(listener);
  }

  public removeConfigListener(listener: (config: WebSocketConfig) => void) {
    this.configListeners = this.configListeners.filter(l => l !== listener);
  }

  private notifyListeners() {
    this.configListeners.forEach(listener => {
      try {
        listener(this.getConfig());
      } catch (error) {
        console.error('Error in WebSocket config listener:', error);
      }
    });
  }

  // Utility methods
  public getConnectionConfig() {
    return {
      timeout: this.config.connection.timeout,
      maxRetries: this.config.connection.maxRetries,
      retryDelay: this.config.connection.retryDelay,
    };
  }

  public getStatusMessage(): string {
    switch (this.config.mode) {
      case 'enabled':
        return 'Real-time features enabled';
      case 'disabled':
        return 'Real-time features disabled';
      case 'fallback':
        return 'Using fallback mode';
      case 'maintenance':
        return 'Real-time features under maintenance';
      default:
        return 'Unknown status';
    }
  }

  public getRecommendedFallback(feature: string): 'polling' | 'manual' | 'disabled' {
    if (!this.isWebSocketEnabled()) {
      switch (feature) {
        case 'search':
          return 'manual'; // Manual refresh for search
        case 'analytics':
          return 'polling'; // Polling for analytics
        case 'notifications':
          return 'disabled'; // Disable real-time notifications
        default:
          return 'manual';
      }
    }
    return 'disabled';
  }
}

// Global instance
export const webSocketConfigService = new WebSocketConfigService();

// React hook for using WebSocket config
export function useWebSocketConfig() {
  const [config, setConfig] = useState<WebSocketConfig>(webSocketConfigService.getConfig());

  useEffect(() => {
    const handleConfigChange = (newConfig: WebSocketConfig) => {
      setConfig(newConfig);
    };

    webSocketConfigService.addConfigListener(handleConfigChange);

    return () => {
      webSocketConfigService.removeConfigListener(handleConfigChange);
    };
  }, []);

  return {
    config,
    isEnabled: webSocketConfigService.isWebSocketEnabled(),
    isFeatureEnabled: (feature: keyof WebSocketConfig['features']) => 
      webSocketConfigService.isFeatureEnabled(feature),
    shouldUseFallback: webSocketConfigService.shouldUseFallback(),
    shouldUsePolling: webSocketConfigService.shouldUsePolling(),
    getPollingInterval: webSocketConfigService.getPollingInterval(),
    setEnabled: webSocketConfigService.setWebSocketEnabled.bind(webSocketConfigService),
    setFeatureEnabled: webSocketConfigService.setFeatureEnabled.bind(webSocketConfigService),
    setMode: webSocketConfigService.setMode.bind(webSocketConfigService),
    getStatusMessage: webSocketConfigService.getStatusMessage(),
  };
}
