/**
 * Development utilities for debugging and monitoring
 * Only active in development environment
 */

export class DevUtils {
  static isEnabled = import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEBUG === 'true'

  static log(category: string, message: string, data?: any) {
    if (!DevUtils.isEnabled) return
    
    const timestamp = new Date().toISOString().substring(11, 23)
    const emoji = DevUtils.getCategoryEmoji(category)
    
    console.log(`${emoji} [${timestamp}] ${category}: ${message}`, data || '')
  }

  static error(category: string, message: string, error?: any) {
    if (!DevUtils.isEnabled) return
    
    const timestamp = new Date().toISOString().substring(11, 23)
    console.error(`❌ [${timestamp}] ${category}: ${message}`, error || '')
  }

  static warn(category: string, message: string, data?: any) {
    if (!DevUtils.isEnabled) return
    
    const timestamp = new Date().toISOString().substring(11, 23)
    console.warn(`⚠️ [${timestamp}] ${category}: ${message}`, data || '')
  }

  static performance(label: string, fn: () => void | Promise<void>) {
    if (!DevUtils.isEnabled || !import.meta.env.VITE_SHOW_PERFORMANCE_METRICS) return fn()
    
    const start = performance.now()
    const result = fn()
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const end = performance.now()
        console.log(`⏱️ Performance [${label}]: ${(end - start).toFixed(2)}ms`)
      })
    } else {
      const end = performance.now()
      console.log(`⏱️ Performance [${label}]: ${(end - start).toFixed(2)}ms`)
      return result
    }
  }

  static getCategoryEmoji(category: string): string {
    const emojiMap: Record<string, string> = {
      'auth': '🔐',
      'api': '🌐',
      'ui': '🎨',
      'data': '📊',
      'navigation': '🧭',
      'storage': '💾',
      'error': '❌',
      'success': '✅',
      'info': 'ℹ️',
      'warning': '⚠️'
    }
    
    return emojiMap[category.toLowerCase()] || '🔧'
  }

  static displayAppInfo() {
    if (!DevUtils.isEnabled) return
    
    console.group('🚀 CivicPulse Development Info')
    console.log('Environment:', import.meta.env.MODE)
    console.log('API URL:', import.meta.env.VITE_API_URL)
    console.log('Version:', import.meta.env.VITE_APP_VERSION)
    console.log('Debug Mode:', import.meta.env.VITE_ENABLE_DEBUG)
    console.log('Build Time:', new Date().toISOString())
    console.groupEnd()
  }

  static createDebugPanel() {
    if (!DevUtils.isEnabled) return null
    
    return {
      clearStorage: () => {
        localStorage.clear()
        sessionStorage.clear()
        console.log('🧹 Storage cleared')
        window.location.reload()
      },
      exportLogs: () => {
        // In a real implementation, you'd collect and export logs
        console.log('📋 Logs exported to console')
      },
      toggleNetworkLogging: () => {
        // Toggle API request logging
        console.log('🌐 Network logging toggled')
      }
    }
  }
}

// Auto-display app info on load in development
if (DevUtils.isEnabled) {
  DevUtils.displayAppInfo()
}

export default DevUtils
