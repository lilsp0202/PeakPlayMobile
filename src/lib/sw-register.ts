'use client';

export interface PWAInstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export class PWAService {
  private static instance: PWAService;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private deferredPrompt: PWAInstallPrompt | null = null;
  private installPromptHandlers: Set<(canInstall: boolean) => void> = new Set();

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializePWA();
    }
  }

  public static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService();
    }
    return PWAService.instance;
  }

  private async initializePWA(): Promise<void> {
    // Register service worker
    await this.registerServiceWorker();
    
    // Set up install prompt listeners
    this.setupInstallPrompt();
    
    // Set up app update detection
    this.setupUpdateDetection();
    
    // Set up network status detection
    this.setupNetworkDetection();
  }

  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        console.log('PWA: Registering service worker...');
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        this.swRegistration = registration;

        // Check for updates
        registration.addEventListener('updatefound', () => {
          console.log('PWA: New service worker found, preparing update...');
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('PWA: New content available, reload required');
                this.notifyUpdate();
              }
            });
          }
        });

        console.log('PWA: Service worker registered successfully');
      } catch (error) {
        console.error('PWA: Service worker registration failed:', error);
      }
    }
  }

  private setupInstallPrompt(): void {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA: Install prompt available');
      e.preventDefault();
      this.deferredPrompt = e as PWAInstallPrompt;
      this.notifyInstallAvailable(true);
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA: App installed successfully');
      this.deferredPrompt = null;
      this.notifyInstallAvailable(false);
    });
  }

  private setupUpdateDetection(): void {
    // Listen for service worker messages
    navigator.serviceWorker?.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
        this.notifyUpdate();
      }
    });
  }

  private setupNetworkDetection(): void {
    // Monitor online/offline status
    window.addEventListener('online', () => {
      console.log('PWA: Back online');
      this.syncOfflineData();
    });

    window.addEventListener('offline', () => {
      console.log('PWA: Gone offline');
    });
  }

  public async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('PWA: Install prompt not available');
      return false;
    }

    try {
      // Show the install prompt
      await this.deferredPrompt.prompt();
      
      // Wait for user choice
      const choiceResult = await this.deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA: User accepted install prompt');
        this.deferredPrompt = null;
        this.notifyInstallAvailable(false);
        return true;
      } else {
        console.log('PWA: User dismissed install prompt');
        return false;
      }
    } catch (error) {
      console.error('PWA: Error during install:', error);
      return false;
    }
  }

  public isInstallAvailable(): boolean {
    return this.deferredPrompt !== null;
  }

  public isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  public onInstallAvailable(handler: (canInstall: boolean) => void): () => void {
    this.installPromptHandlers.add(handler);
    
    // Immediately call with current state
    handler(this.isInstallAvailable());
    
    // Return unsubscribe function
    return () => {
      this.installPromptHandlers.delete(handler);
    };
  }

  private notifyInstallAvailable(available: boolean): void {
    this.installPromptHandlers.forEach(handler => handler(available));
  }

  private notifyUpdate(): void {
    // Show update notification
    if (Notification.permission === 'granted') {
      new Notification('PeakPlay Update Available', {
        body: 'A new version of PeakPlay is ready. Refresh to update.',
        icon: '/icons/icon-192x192.png',
        tag: 'app-update'
      });
    }
    
    // You could also dispatch a custom event here for UI components to listen to
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  }

  public async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  public async syncOfflineData(): Promise<void> {
    if (this.swRegistration && 'serviceWorker' in navigator) {
      try {
        // Check if background sync is supported
        if ('sync' in window.ServiceWorkerRegistration.prototype) {
          await (this.swRegistration as any).sync.register('skill-update');
          console.log('PWA: Background sync registered');
        } else {
          console.log('PWA: Background sync not supported');
        }
      } catch (error) {
        console.error('PWA: Background sync registration failed:', error);
      }
    }
  }

  public getCacheStatus(): Promise<{ static: number; dynamic: number }> {
    return new Promise((resolve) => {
      if ('caches' in window) {
        Promise.all([
          caches.open('peakplay-static-v1').then(cache => cache.keys()),
          caches.open('peakplay-dynamic-v1').then(cache => cache.keys())
        ]).then(([staticKeys, dynamicKeys]) => {
          resolve({
            static: staticKeys.length,
            dynamic: dynamicKeys.length
          });
        }).catch(() => {
          resolve({ static: 0, dynamic: 0 });
        });
      } else {
        resolve({ static: 0, dynamic: 0 });
      }
    });
  }

  public async clearCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('PWA: All caches cleared');
    }
  }
} 