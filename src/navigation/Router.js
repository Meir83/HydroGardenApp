import React, { memo, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import App from '../App';

// Lazy load screen components for better performance
const Plants = lazy(() => import('../screens/Plants'));
const Calendar = lazy(() => import('../screens/Calendar'));
const Guide = lazy(() => import('../screens/Guide'));
const Community = lazy(() => import('../screens/Community'));
const Settings = lazy(() => import('../screens/Settings'));

// Loading component for Suspense fallback
const LoadingSpinner = memo(() => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
    direction: 'rtl',
    fontFamily: 'Arial'
  }}>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16
    }}>
      <div style={{
        width: 40,
        height: 40,
        border: '4px solid #e0e0e0',
        borderTop: '4px solid #2e7d32',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <div style={{ color: '#666', fontSize: 14 }}>טוען...</div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  </div>
));

const menu = [
  { path: '/', label: 'בית', icon: '🏠' },
  { path: '/plants', label: 'צמחים', icon: '🌱' },
  { path: '/calendar', label: 'יומן', icon: '📅' },
  { path: '/guide', label: 'מדריך', icon: '📖' },
  { path: '/community', label: 'קהילה', icon: '👥' },
  { path: '/settings', label: 'הגדרות', icon: '⚙️' },
];

const NavigationBar = memo(() => {
  const location = useLocation();
  
  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-around', 
      background: '#fff', 
      borderTop: '1px solid #eee', 
      padding: 8,
      boxShadow: '0 -2px 8px rgba(0,0,0,0.1)' 
    }}>
      {menu.map(item => (
        <Link
          key={item.path}
          to={item.path}
          style={{
            background: location.pathname === item.path ? '#e0f7fa' : 'transparent',
            border: 'none',
            borderRadius: 8,
            padding: 8,
            fontWeight: 'bold',
            color: '#333',
            fontSize: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            textDecoration: 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <span style={{ fontSize: 22 }}>{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
});

const AppLayout = memo(() => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f9f9f9', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <div style={{ flex: 1 }}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/plants" element={<Plants />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/community" element={<Community />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </div>
      <NavigationBar />
    </div>
  );
});

export default function AppRouter() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
} 