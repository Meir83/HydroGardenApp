import React, { memo, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import EnhancedApp from '../EnhancedApp';
import LoadingSpinner from '../components/LoadingSpinner';
import { ToastContainer } from '../components/Toast';
import { theme } from '../styles/theme';
import { navigation } from '../styles/responsive';
import PageTransition from '../components/PageTransition';

// Lazy load screen components for better performance
const Plants = lazy(() => import('../screens/Plants'));
const Calendar = lazy(() => import('../screens/Calendar'));
const Guide = lazy(() => import('../screens/Guide'));
const Community = lazy(() => import('../screens/Community'));
const Settings = lazy(() => import('../screens/Settings'));

const menu = [
  { path: '/', label: 'בית', icon: '🏠', ariaLabel: 'עמוד הבית' },
  { path: '/plants', label: 'צמחים', icon: '🌱', ariaLabel: 'ניהול צמחים' },
  { path: '/calendar', label: 'יומן', icon: '📅', ariaLabel: 'לוח זמנים ותזכורות' },
  { path: '/guide', label: 'מדריך', icon: '📖', ariaLabel: 'מדריך למתחילים' },
  { path: '/community', label: 'קהילה', icon: '👥', ariaLabel: 'קהילת גננים' },
  { path: '/settings', label: 'הגדרות', icon: '⚙️', ariaLabel: 'הגדרות מערכת' },
];

// Enhanced loading component
const PageLoadingSpinner = memo(() => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    direction: 'rtl'
  }}>
    <LoadingSpinner 
      size="large" 
      label="טוען עמוד..." 
    />
  </div>
));

// Enhanced Navigation Bar with better accessibility
const NavigationBar = memo(() => {
  const location = useLocation();
  
  return (
    <nav 
      style={navigation.bottomNav}
      role="navigation"
      aria-label="תפריט ניווט ראשי"
    >
      {menu.map(item => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...navigation.navItem,
              backgroundColor: isActive ? `${theme.colors.primary.main}15` : 'transparent',
              color: isActive ? theme.colors.primary.main : theme.colors.text.secondary,
              borderRadius: theme.borderRadius.md,
              fontWeight: isActive ? theme.typography.fontWeights.semibold : theme.typography.fontWeights.normal,
              position: 'relative',
              transition: `all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut}`
            }}
            className={isActive ? 'active' : ''}
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.ariaLabel}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = theme.colors.primary.main;
                e.currentTarget.style.backgroundColor = `${theme.colors.primary.main}10`;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = theme.colors.text.secondary;
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = `2px solid ${theme.colors.primary.main}`;
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
          >
            {/* Active indicator */}
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  top: -2,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '24px',
                  height: '3px',
                  backgroundColor: theme.colors.primary.main,
                  borderRadius: '0 0 3px 3px'
                }}
                aria-hidden="true"
              />
            )}
            
            <span 
              style={{ 
                fontSize: 22, 
                marginBottom: theme.spacing.xs,
                transition: `transform ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
                transform: isActive ? 'scale(1.1)' : 'scale(1)'
              }}
              aria-hidden="true"
            >
              {item.icon}
            </span>
            <span style={{ 
              fontSize: theme.typography.fontSizes.xs,
              textAlign: 'center'
            }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
});

// Page wrapper with transitions
const PageWrapper = memo(({ children }) => {
  const location = useLocation();
  
  return (
    <PageTransition
      key={location.pathname}
      isVisible={true}
      transitionType="slideUp"
      duration="normal"
    >
      {children}
    </PageTransition>
  );
});

function AppLayout() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: theme.colors.background.default, 
      display: 'flex', 
      flexDirection: 'column',
      fontFamily: theme.typography.fontFamily
    }}>
      <main style={{ 
        flex: 1, 
        paddingBottom: '80px', // Account for bottom navigation
        minHeight: 'calc(100vh - 80px)'
      }}>
        <Suspense fallback={<PageLoadingSpinner />}>
          <Routes>
            <Route path="/" element={
              <PageWrapper>
                <EnhancedApp />
              </PageWrapper>
            } />
            <Route path="/plants" element={
              <PageWrapper>
                <Plants />
              </PageWrapper>
            } />
            <Route path="/calendar" element={
              <PageWrapper>
                <Calendar />
              </PageWrapper>
            } />
            <Route path="/guide" element={
              <PageWrapper>
                <Guide />
              </PageWrapper>
            } />
            <Route path="/community" element={
              <PageWrapper>
                <Community />
              </PageWrapper>
            } />
            <Route path="/settings" element={
              <PageWrapper>
                <Settings />
              </PageWrapper>
            } />
          </Routes>
        </Suspense>
      </main>
      <NavigationBar />
      <ToastContainer />
    </div>
  );
}

export default function EnhancedAppRouter() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}