// Service Worker Registration and Management
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

class ServiceWorkerManager {
  constructor() {
    this.registration = null;
    this.isUpdateAvailable = false;
    this.callbacks = {
      onSuccess: [],
      onUpdate: [],
      onError: []
    };
  }

  // Register service worker
  async register() {
    if ('serviceWorker' in navigator) {
      try {
        const swUrl = `${process.env.PUBLIC_URL}/sw.js`;
        
        if (isLocalhost) {
          // Check if service worker exists in localhost
          await this.checkValidServiceWorker(swUrl);
        } else {
          // Register service worker in production
          await this.registerValidSW(swUrl);
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        this.notifyCallbacks('onError', error);
      }
    } else {
      console.log('Service Worker not supported in this browser');
    }
  }

  // Register valid service worker
  async registerValidSW(swUrl) {
    try {
      this.registration = await navigator.serviceWorker.register(swUrl);
      
      this.registration.onupdatefound = () => {
        const installingWorker = this.registration.installing;
        
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New service worker available
                console.log('New service worker available');
                this.isUpdateAvailable = true;
                this.notifyCallbacks('onUpdate', this.registration);
              } else {
                // Service worker cached for first time
                console.log('Service worker cached for offline use');
                this.notifyCallbacks('onSuccess', this.registration);
              }
            }
          };
        }
      };

      console.log('Service Worker registered successfully');
      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  // Check if service worker exists (for localhost)
  async checkValidServiceWorker(swUrl) {
    try {
      const response = await fetch(swUrl, {
        headers: { 'Service-Worker': 'script' }
      });

      const contentType = response.headers.get('content-type');
      
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // Service worker not found or invalid
        const registration = await navigator.serviceWorker.ready;
        await registration.unregister();
        window.location.reload();
      } else {
        // Service worker found, register it
        await this.registerValidSW(swUrl);
      }
    } catch (error) {
      console.log('No internet connection. App is running in offline mode.');
      this.notifyCallbacks('onError', error);
    }
  }

  // Unregister service worker
  async unregister() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.unregister();
        console.log('Service Worker unregistered successfully');
        return true;
      } catch (error) {
        console.error('Service Worker unregistration failed:', error);
        return false;
      }
    }
    return false;
  }

  // Update service worker
  async update() {
    if (this.registration) {
      try {
        await this.registration.update();
        console.log('Service Worker update check completed');
      } catch (error) {
        console.error('Service Worker update failed:', error);
      }
    }
  }

  // Skip waiting and activate new service worker
  async skipWaiting() {
    if (this.registration && this.registration.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Listen for controlling change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }

  // Add callback for events
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }

  // Remove callback
  off(event, callback) {
    if (this.callbacks[event]) {
      const index = this.callbacks[event].indexOf(callback);
      if (index > -1) {
        this.callbacks[event].splice(index, 1);
      }
    }
  }

  // Notify callbacks
  notifyCallbacks(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in service worker callback:', error);
        }
      });
    }
  }

  // Check if update is available
  getUpdateAvailable() {
    return this.isUpdateAvailable;
  }

  // Send message to service worker
  postMessage(message) {
    if (this.registration && this.registration.active) {
      this.registration.active.postMessage(message);
    }
  }

  // Cache specific URLs
  cacheUrls(urls) {
    this.postMessage({
      type: 'CACHE_URLS',
      payload: urls
    });
  }

  // Clear all caches
  clearCache() {
    this.postMessage({
      type: 'CLEAR_CACHE'
    });
  }
}

// Create singleton instance
const serviceWorkerManager = new ServiceWorkerManager();

export default serviceWorkerManager;

// React hook for service worker
export const useServiceWorker = () => {
  const [isRegistered, setIsRegistered] = React.useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    // Register callbacks
    const onSuccess = () => {
      setIsRegistered(true);
      setError(null);
    };

    const onUpdate = () => {
      setIsUpdateAvailable(true);
    };

    const onError = (err) => {
      setError(err);
    };

    serviceWorkerManager.on('onSuccess', onSuccess);
    serviceWorkerManager.on('onUpdate', onUpdate);
    serviceWorkerManager.on('onError', onError);

    // Register service worker
    serviceWorkerManager.register();

    // Cleanup
    return () => {
      serviceWorkerManager.off('onSuccess', onSuccess);
      serviceWorkerManager.off('onUpdate', onUpdate);
      serviceWorkerManager.off('onError', onError);
    };
  }, []);

  const updateServiceWorker = React.useCallback(() => {
    serviceWorkerManager.skipWaiting();
  }, []);

  const clearCache = React.useCallback(() => {
    serviceWorkerManager.clearCache();
  }, []);

  return {
    isRegistered,
    isUpdateAvailable,
    error,
    updateServiceWorker,
    clearCache
  };
};