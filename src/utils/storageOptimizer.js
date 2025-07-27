// Optimized localStorage operations with debouncing and caching
import React from 'react';
class StorageOptimizer {
  constructor() {
    this.cache = new Map();
    this.debounceTimers = new Map();
    this.DEBOUNCE_DELAY = 300; // 300ms debounce
  }

  // Get item from cache first, then localStorage
  getItem(key) {
    // Check cache first
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    try {
      const value = localStorage.getItem(key);
      if (value !== null) {
        // Store in cache for faster access
        this.cache.set(key, value);
        return value;
      }
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}":`, error);
    }
    
    return null;
  }

  // Set item with debouncing to reduce writes
  setItem(key, value) {
    try {
      // Immediately update cache
      this.cache.set(key, value);

      // Clear existing timer if it exists
      if (this.debounceTimers.has(key)) {
        clearTimeout(this.debounceTimers.get(key));
      }

      // Set debounced write to localStorage
      const timer = setTimeout(() => {
        try {
          localStorage.setItem(key, value);
          this.debounceTimers.delete(key);
        } catch (error) {
          console.error(`Error writing to localStorage for key "${key}":`, error);
          // If localStorage fails, keep in cache only
        }
      }, this.DEBOUNCE_DELAY);

      this.debounceTimers.set(key, timer);
    } catch (error) {
      console.error(`Error in setItem for key "${key}":`, error);
    }
  }

  // Remove item from both cache and localStorage
  removeItem(key) {
    try {
      this.cache.delete(key);
      
      // Clear debounce timer if exists
      if (this.debounceTimers.has(key)) {
        clearTimeout(this.debounceTimers.get(key));
        this.debounceTimers.delete(key);
      }

      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage for key "${key}":`, error);
    }
  }

  // Force immediate write to localStorage (bypass debouncing)
  flushItem(key) {
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
      this.debounceTimers.delete(key);
      
      if (this.cache.has(key)) {
        try {
          localStorage.setItem(key, this.cache.get(key));
        } catch (error) {
          console.error(`Error flushing to localStorage for key "${key}":`, error);
        }
      }
    }
  }

  // Flush all pending writes
  flushAll() {
    this.debounceTimers.forEach((timer, key) => {
      clearTimeout(timer);
      if (this.cache.has(key)) {
        try {
          localStorage.setItem(key, this.cache.get(key));
        } catch (error) {
          console.error(`Error flushing to localStorage for key "${key}":`, error);
        }
      }
    });
    this.debounceTimers.clear();
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache size for monitoring
  getCacheSize() {
    return this.cache.size;
  }

  // Check if localStorage is available
  isAvailable() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
}

// Create singleton instance
const storageOptimizer = new StorageOptimizer();

// Flush all pending writes before page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    storageOptimizer.flushAll();
  });

  // Also flush on page visibility change (when tab becomes hidden)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      storageOptimizer.flushAll();
    }
  });
}

export default storageOptimizer;

// Helper hooks for React components
export const useOptimizedStorage = (key, defaultValue) => {
  const [value, setValue] = React.useState(() => {
    const stored = storageOptimizer.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  });

  const setStoredValue = React.useCallback((newValue) => {
    setValue(newValue);
    storageOptimizer.setItem(key, JSON.stringify(newValue));
  }, [key]);

  return [value, setStoredValue];
};