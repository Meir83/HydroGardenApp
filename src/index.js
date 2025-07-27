import React from 'react';
import './styles/global.css';
import { createRoot } from 'react-dom/client';
import EnhancedAppRouter from './navigation/EnhancedRouter';
import serviceWorkerManager from './utils/serviceWorkerRegistration';
import performanceMonitor from './utils/performanceMonitor';

const container = document.getElementById('root');
const root = createRoot(container);

// Register service worker for offline capabilities
serviceWorkerManager.register();

// Set up performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  // Log performance summary every 30 seconds in development
  setInterval(() => {
    performanceMonitor.logSummary();
  }, 30000);
}

root.render(<EnhancedAppRouter />); 