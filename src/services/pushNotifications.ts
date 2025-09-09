/**
 * Browser Push Notification Service
 * Handles browser push notifications using Service Worker and Web Push API
 */

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationOptions {
  title: string;
  message: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  silent?: boolean;
  vibrate?: number[];
}

class BrowserPushNotificationService {
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private pushSubscription: PushSubscription | null = null;
  private vapidPublicKey: string | null = null;

  /**
   * Initialize the push notification service
   */
  async initialize(): Promise<boolean> {
    try {
      // Check if service worker is supported
      if (!('serviceWorker' in navigator)) {
        console.warn('Service Worker not supported');
        return false;
      }

      // Check if push notifications are supported
      if (!('PushManager' in window)) {
        console.warn('Push notifications not supported');
        return false;
      }

      // Register service worker
      this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully');

      // Get existing subscription
      this.pushSubscription = await this.serviceWorkerRegistration.pushManager.getSubscription();

      return true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    // Request permission
    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    
    return permission;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<PushSubscriptionData | null> {
    try {
      if (!this.serviceWorkerRegistration) {
        throw new Error('Service Worker not registered');
      }

      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Get VAPID public key from server
      if (!this.vapidPublicKey) {
        this.vapidPublicKey = await this.getVapidPublicKey();
      }

      // Subscribe to push notifications
      this.pushSubscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      // Send subscription to server
      const subscriptionData = this.subscriptionToData(this.pushSubscription);
      await this.sendSubscriptionToServer(subscriptionData);

      console.log('Successfully subscribed to push notifications');
      return subscriptionData;

    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    try {
      if (!this.pushSubscription) {
        return true;
      }

      const success = await this.pushSubscription.unsubscribe();
      if (success) {
        await this.removeSubscriptionFromServer();
        this.pushSubscription = null;
        console.log('Successfully unsubscribed from push notifications');
      }

      return success;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  /**
   * Check if user is subscribed to push notifications
   */
  async isSubscribed(): Promise<boolean> {
    if (!this.serviceWorkerRegistration) {
      return false;
    }

    this.pushSubscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
    return this.pushSubscription !== null;
  }

  /**
   * Show a local notification (doesn't require push)
   */
  async showLocalNotification(options: NotificationOptions): Promise<boolean> {
    try {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        return false;
      }

      const notification = new Notification(options.title, {
        body: options.message,
        icon: options.icon || '/vite.svg',
        badge: options.badge || '/vite.svg',
        tag: options.tag,
        data: options.data,
        silent: options.silent || false
        // vibrate: options.vibrate || [200, 100, 200] // Not supported in NotificationOptions
      });

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        // Navigate to action URL if provided
        if (options.data?.action_url) {
          window.location.href = options.data.action_url;
        }
        
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      return true;
    } catch (error) {
      console.error('Failed to show local notification:', error);
      return false;
    }
  }

  /**
   * Get notification permission status
   */
  getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Check if push notifications are supported
   */
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 
           'PushManager' in window && 
           'Notification' in window;
  }

  /**
   * Convert URL-safe base64 to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Convert PushSubscription to data object
   */
  private subscriptionToData(subscription: PushSubscription): PushSubscriptionData {
    const key = subscription.getKey('p256dh');
    const auth = subscription.getKey('auth');

    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: key ? btoa(String.fromCharCode(...new Uint8Array(key))) : '',
        auth: auth ? btoa(String.fromCharCode(...new Uint8Array(auth))) : ''
      }
    };
  }

  /**
   * Get VAPID public key from server
   */
  private async getVapidPublicKey(): Promise<string> {
    try {
      // Replace with your actual endpoint
      const response = await fetch('/api/v1/notifications/vapid-public-key');
      const data = await response.json();
      return data.public_key; // Updated to match backend response format
    } catch (error) {
      console.error('Failed to get VAPID public key:', error);
      // Fallback public key (should match the backend's real key)
      return 'BAGbZLcPHdFYm51AkCL_zLl2VG5TrgKSTwCmD6d_OIhuISRztuPYQt4bNexSj8AelMveylS_J2uuEhILYnJq0uM';
    }
  }

  /**
   * Send subscription to server
   */
  private async sendSubscriptionToServer(subscription: PushSubscriptionData): Promise<void> {
    try {
      const response = await fetch('/api/v1/notifications/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('civic_access_token')}`
        },
        body: JSON.stringify(subscription)
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
      throw error;
    }
  }

  /**
   * Remove subscription from server
   */
  private async removeSubscriptionFromServer(): Promise<void> {
    try {
      const response = await fetch('/api/v1/notifications/push-subscription', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('civic_access_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove subscription from server');
      }
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
    }
  }
}

// Global instance
export const pushNotificationService = new BrowserPushNotificationService();
export default pushNotificationService;
