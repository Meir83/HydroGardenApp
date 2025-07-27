import React from 'react';
import { theme } from '../styles/theme';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  label = 'טוען...',
  overlay = false,
  className = '' 
}) => {
  const sizes = {
    small: 16,
    medium: 24,
    large: 32,
    xlarge: 48
  };

  const colors = {
    primary: theme.colors.primary.main,
    secondary: theme.colors.secondary.main,
    white: '#ffffff',
    grey: theme.colors.grey[600]
  };

  const spinnerSize = sizes[size] || sizes.medium;
  const spinnerColor = colors[color] || colors.primary;

  const spinnerStyle = {
    width: spinnerSize,
    height: spinnerSize,
    border: `3px solid ${theme.colors.grey[200]}`,
    borderTop: `3px solid ${spinnerColor}`,
    borderRadius: '50%',
    animation: 'hydrogardenSpin 1s linear infinite',
    display: 'inline-block'
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSizes.sm,
    direction: 'rtl'
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(2px)',
    zIndex: theme.zIndex.overlay,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  // Inject keyframes for spinner animation
  React.useEffect(() => {
    const styleId = 'hydrogarden-spinner-keyframes';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes hydrogardenSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const content = (
    <div 
      className={className}
      style={containerStyle}
      role="status"
      aria-label={label}
      aria-live="polite"
    >
      <div style={spinnerStyle} aria-hidden="true" />
      {label && (
        <span style={{ fontSize: theme.typography.fontSizes.sm }}>
          {label}
        </span>
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