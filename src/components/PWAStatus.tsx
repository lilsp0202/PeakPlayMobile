'use client';

import { useState, useEffect } from 'react';
import { PWAService } from '@/lib/sw-register';

export default function PWAStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [cacheStatus, setCacheStatus] = useState({ static: 0, dynamic: 0 });

  useEffect(() => {
    const pwaService = PWAService.getInstance();
    
    // Initial status
    setIsOnline(navigator.onLine);
    setIsInstalled(pwaService.isInstalled());
    
    // Network status listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Update availability listener
    const handleUpdateAvailable = () => setUpdateAvailable(true);
    window.addEventListener('pwa-update-available', handleUpdateAvailable);
    
    // Get cache status
    pwaService.getCacheStatus().then(setCacheStatus);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleClearCache = async () => {
    const pwaService = PWAService.getInstance();
    await pwaService.clearCache();
    setCacheStatus({ static: 0, dynamic: 0 });
    window.location.reload();
  };

  return (
    <div className="space-y-2">
      {/* Connection Status */}
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
        isOnline 
          ? 'bg-green-50 text-green-700 border border-green-200' 
          : 'bg-red-50 text-red-700 border border-red-200'
      }`}>
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
        <span>{isOnline ? 'Online' : 'Offline'}</span>
        {!isOnline && (
          <span className="text-xs opacity-75">- Working from cache</span>
        )}
      </div>

      {/* PWA Status */}
      {isInstalled && (
        <div className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm bg-blue-50 text-blue-700 border border-blue-200">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span>Running as PWA</span>
        </div>
      )}

      {/* Update Available */}
      {updateAvailable && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg text-sm bg-yellow-50 text-yellow-800 border border-yellow-200">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Update available</span>
          </div>
          <button
            onClick={handleRefresh}
            className="px-2 py-1 text-xs bg-yellow-200 hover:bg-yellow-300 rounded transition-colors"
          >
            Refresh
          </button>
        </div>
      )}

      {/* Cache Status */}
      {(cacheStatus.static > 0 || cacheStatus.dynamic > 0) && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg text-sm bg-gray-50 text-gray-600 border border-gray-200">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
            </svg>
            <span>Cached: {cacheStatus.static + cacheStatus.dynamic} items</span>
          </div>
          <button
            onClick={handleClearCache}
            className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
} 