// Performance monitoring and metrics collection
class PerformanceMonitor {
  constructor() {
    this.metrics = [];
    this.renderTimes = new Map();
    this.navigationTimes = [];
    this.errorCount = 0;
    this.isEnabled = process.env.NODE_ENV === 'development' || process.env.REACT_APP_ENABLE_PERFORMANCE_MONITORING === 'true';
  }

  // Measure component render time
  startRenderMeasure(componentName) {
    if (!this.isEnabled) return null;
    
    const startTime = performance.now();
    const measureId = `${componentName}-${Date.now()}`;
    
    return {
      measureId,
      finish: () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (!this.renderTimes.has(componentName)) {
          this.renderTimes.set(componentName, []);
        }
        
        this.renderTimes.get(componentName).push(duration);
        
        // Keep only last 100 measurements per component
        const times = this.renderTimes.get(componentName);
        if (times.length > 100) {
          times.splice(0, times.length - 100);
        }

        // Log slow renders (> 16ms for 60fps)
        if (duration > 16) {
          console.warn(`Slow render detected: ${componentName} took ${duration.toFixed(2)}ms`);
        }

        return duration;
      }
    };
  }

  // Measure navigation time
  measureNavigation(from, to) {
    if (!this.isEnabled) return;
    
    const startTime = performance.now();
    
    // Use setTimeout to measure after navigation completes
    setTimeout(() => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.navigationTimes.push({
        from,
        to,
        duration,
        timestamp: new Date().toISOString()
      });

      // Keep only last 50 navigation measurements
      if (this.navigationTimes.length > 50) {
        this.navigationTimes.shift();
      }

      console.log(`Navigation ${from} → ${to}: ${duration.toFixed(2)}ms`);
    }, 0);
  }

  // Record custom metric
  recordMetric(name, value, unit = 'ms') {
    if (!this.isEnabled) return;
    
    this.metrics.push({
      name,
      value,
      unit,
      timestamp: new Date().toISOString()
    });

    // Keep only last 200 metrics
    if (this.metrics.length > 200) {
      this.metrics.shift();
    }
  }

  // Record error
  recordError(error, context = '') {
    this.errorCount++;
    console.error('Performance Monitor - Error recorded:', {
      error: error.message,
      context,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }

  // Get performance summary
  getSummary() {
    if (!this.isEnabled) return null;

    const summary = {
      renderTimes: {},
      navigationTimes: this.navigationTimes.slice(-10), // Last 10 navigations
      customMetrics: this.metrics.slice(-20), // Last 20 metrics
      errorCount: this.errorCount,
      timestamp: new Date().toISOString()
    };

    // Calculate render time statistics
    this.renderTimes.forEach((times, componentName) => {
      if (times.length === 0) return;
      
      const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
      const max = Math.max(...times);
      const min = Math.min(...times);
      
      summary.renderTimes[componentName] = {
        average: Number(avg.toFixed(2)),
        max: Number(max.toFixed(2)),
        min: Number(min.toFixed(2)),
        count: times.length
      };
    });

    return summary;
  }

  // Get memory usage (if available)
  getMemoryUsage() {
    if (!this.isEnabled) return null;
    
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
      };
    }
    
    return null;
  }

  // Log performance summary to console
  logSummary() {
    if (!this.isEnabled) return;
    
    const summary = this.getSummary();
    const memory = this.getMemoryUsage();
    
    console.group('🔍 Performance Summary');
    
    if (Object.keys(summary.renderTimes).length > 0) {
      console.table(summary.renderTimes);
    }
    
    if (summary.navigationTimes.length > 0) {
      console.log('Recent Navigations:', summary.navigationTimes);
    }
    
    if (memory) {
      console.log('Memory Usage:', memory);
    }
    
    if (summary.errorCount > 0) {
      console.warn(`Errors recorded: ${summary.errorCount}`);
    }
    
    console.groupEnd();
  }

  // Clear all metrics
  clear() {
    this.metrics = [];
    this.renderTimes.clear();
    this.navigationTimes = [];
    this.errorCount = 0;
  }

  // Enable/disable monitoring
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Set up global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    performanceMonitor.recordError(event.error, 'Global error handler');
  });

  window.addEventListener('unhandledrejection', (event) => {
    performanceMonitor.recordError(event.reason, 'Unhandled promise rejection');
  });
}

export default performanceMonitor;

// React hook for measuring component performance
export const usePerformanceMonitor = (componentName) => {
  const startMeasure = React.useCallback(() => {
    return performanceMonitor.startRenderMeasure(componentName);
  }, [componentName]);

  const recordMetric = React.useCallback((name, value, unit) => {
    performanceMonitor.recordMetric(`${componentName}.${name}`, value, unit);
  }, [componentName]);

  return { startMeasure, recordMetric };
};