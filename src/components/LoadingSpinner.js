import React from 'react';
import { theme } from '../styles/theme';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  label = 'טוען...',
  overlay = false,
  className = '' 
}) => {
  const sizeMap = {
    small: '20px',
    medium: '40px',
    large: '60px',
    xlarge: '80px'
  };

  const colorMap = {
    primary: theme.colors.primary.main,
    secondary: theme.colors.secondary.main,
    success: theme.colors.success,
    warning: theme.colors.warning,
    error: theme.colors.error
  };

  const spinnerSize = sizeMap[size] || sizeMap.medium;
  const spinnerColor = colorMap[color] || colorMap.primary;

  const spinnerStyle = {
    width: spinnerSize,
    height: spinnerSize,
    border: `3px solid ${spinnerColor}20`,
    borderTop: `3px solid ${spinnerColor}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md
  };

  const labelStyle = {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '500',
    marginTop: theme.spacing.xs
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(2px)'
  };

  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  const content = (
    <div className={className} style={containerStyle}>
      <style>{keyframes}</style>
      <div style={spinnerStyle} aria-hidden="true" />
      {label && (
        <div style={labelStyle} role="status" aria-live="polite">
          {label}
        </div>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div style={overlayStyle}>
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;