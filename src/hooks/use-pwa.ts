'use client';

import { useState, useEffect, useCallback } from 'react';

// ============================================
// PWA Installation Hook
// ============================================

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Hook to handle PWA installation prompt
 */
export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone);
    }

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!installPrompt) return false;

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
      return true;
    }

    return false;
  }, [installPrompt]);

  return {
    isInstalled,
    isInstallable,
    install,
  };
}

// ============================================
// Offline Status Hook
// ============================================

/**
 * Hook to track online/offline status
 */
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
    resetWasOffline: () => setWasOffline(false),
  };
}

// ============================================
// Service Worker Hook
// ============================================

interface ServiceWorkerStatus {
  isRegistered: boolean;
  isUpdateAvailable: boolean;
  isActivated: boolean;
  registration: ServiceWorkerRegistration | null;
}

/**
 * Hook to manage service worker
 */
export function useServiceWorker() {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    isRegistered: false,
    isUpdateAvailable: false,
    isActivated: false,
    registration: null,
  });

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        setStatus((prev) => ({
          ...prev,
          isRegistered: true,
          registration,
        }));

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setStatus((prev) => ({
                  ...prev,
                  isUpdateAvailable: true,
                }));
              }
              if (newWorker.state === 'activated') {
                setStatus((prev) => ({
                  ...prev,
                  isActivated: true,
                }));
              }
            });
          }
        });
      }).catch((error) => {
        console.error('Service Worker registration failed:', error);
      });

      // Check if already controlled
      if (navigator.serviceWorker.controller) {
        setStatus((prev) => ({
          ...prev,
          isActivated: true,
        }));
      }
    }
  }, []);

  const update = useCallback(() => {
    if (status.registration?.waiting) {
      // Send skip waiting message to the waiting service worker
      status.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [status.registration]);

  const clearCache = useCallback(async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      return true;
    }
    return false;
  }, []);

  return {
    ...status,
    update,
    clearCache,
  };
}

// ============================================
// Push Notifications Hook
// ============================================

interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

/**
 * Hook to manage push notifications
 */
export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    setIsSupported('Notification' in window && 'PushManager' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, [isSupported]);

  const subscribe = useCallback(async (vapidPublicKey: string) => {
    if (!isSupported || permission !== 'granted') return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      setSubscription(sub);
      
      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      });

      return sub;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }, [isSupported, permission]);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return false;

    try {
      await subscription.unsubscribe();
      
      // Remove subscription from server
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      });

      setSubscription(null);
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }, [subscription]);

  const showNotification = useCallback(async (options: PushNotificationOptions) => {
    if (!isSupported || permission !== 'granted') return null;

    const registration = await navigator.serviceWorker.ready;
    return registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon || '/icons/icon-192x192.png',
      badge: options.badge || '/icons/badge-72x72.png',
      tag: options.tag,
      data: options.data,
    });
  }, [isSupported, permission]);

  return {
    isSupported,
    permission,
    isGranted: permission === 'granted',
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ============================================
// Background Sync Hook
// ============================================

interface SyncStatus {
  pending: number;
  syncing: boolean;
  lastSync: Date | null;
}

/**
 * Hook for background sync status
 */
export function useBackgroundSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    pending: 0,
    syncing: false,
    lastSync: null,
  });

  useEffect(() => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      // Listen for sync events from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_STATUS') {
          setSyncStatus({
            pending: event.data.pending,
            syncing: event.data.syncing,
            lastSync: event.data.lastSync ? new Date(event.data.lastSync) : null,
          });
        }
      });
    }
  }, []);

  const registerSync = useCallback(async (tag: string) => {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      // Use any to bypass TypeScript's incomplete type definitions
      await (registration as any).sync.register(tag);
    }
  }, []);

  const forceSync = useCallback(async () => {
    await registerSync('sync-orders');
    await registerSync('sync-deliveries');
  }, [registerSync]);

  return {
    ...syncStatus,
    registerSync,
    forceSync,
  };
}

// ============================================
// Offline Data Storage Hook
// ============================================

interface OfflineDataOptions<T> {
  key: string;
  getOnlineData: () => Promise<T>;
}

/**
 * Hook to manage offline data with IndexedDB
 */
export function useOfflineData<T>({ key, getOnlineData }: OfflineDataOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFromCache, setIsFromCache] = useState(false);
  const { isOnline } = useOfflineStatus();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        if (isOnline) {
          // Try to fetch fresh data
          const freshData = await getOnlineData();
          setData(freshData);
          setIsFromCache(false);
          
          // Store in IndexedDB for offline use
          await storeOfflineData(key, freshData);
        } else {
          // Load from IndexedDB
          const cachedData = await getOfflineData<T>(key);
          setData(cachedData);
          setIsFromCache(true);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        // Try cache as fallback
        const cachedData = await getOfflineData<T>(key);
        if (cachedData) {
          setData(cachedData);
          setIsFromCache(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [key, isOnline, getOnlineData]);

  return {
    data,
    isLoading,
    isFromCache,
    refresh: async () => {
      if (isOnline) {
        const freshData = await getOnlineData();
        setData(freshData);
        setIsFromCache(false);
        await storeOfflineData(key, freshData);
      }
    },
  };
}

// IndexedDB helpers
const DB_NAME = 'restaurant-os-offline';
const DB_VERSION = 1;

async function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('data')) {
        db.createObjectStore('data', { keyPath: 'key' });
      }
    };
  });
}

async function storeOfflineData<T>(key: string, data: T): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('data', 'readwrite');
    const store = transaction.objectStore('data');
    const request = store.put({ key, data, timestamp: Date.now() });
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function getOfflineData<T>(key: string): Promise<T | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('data', 'readonly');
    const store = transaction.objectStore('data');
    const request = store.get(key);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? result.data : null);
    };
  });
}

export default {
  usePWAInstall,
  useOfflineStatus,
  useServiceWorker,
  usePushNotifications,
  useBackgroundSync,
  useOfflineData,
};
