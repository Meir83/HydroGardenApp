import React, { useState, useEffect } from 'react';
import { theme } from '../styles/theme';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 4000, 
  onClose,
  position = 'top-center',
  autoClose = true
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const types = {
    success: {
      background: theme.colors.success.main,
      color: theme.colors.success.contrast,
      icon: '✓'
    },
    error: {
      background: theme.colors.error.main,
      color: theme.colors.error.contrast,
      icon: '✗'
    },
    warning: {
      background: theme.colors.warning.main,
      color: theme.colors.warning.contrast,
      icon: '⚠'
    },
    info: {
      background: theme.colors.info.main,
      color: theme.colors.info.contrast,
      icon: 'ℹ'
    }
  };

  const positions = {
    'top-center': {
      top: theme.spacing.lg,
      left: '50%',
      transform: 'translateX(-50%)',
      animationName: 'hydrogardenToastSlideDown'
    },
    'bottom-center': {
      bottom: theme.spacing.lg,
      left: '50%',
      transform: 'translateX(-50%)',
      animationName: 'hydrogardenToastSlideUp'
    },
    'top-right': {
      top: theme.spacing.lg,
      right: theme.spacing.lg,
      animationName: 'hydrogardenToastSlideLeft'
    },
    'bottom-right': {
      bottom: theme.spacing.lg,
      right: theme.spacing.lg,
      animationName: 'hydrogardenToastSlideLeft'
    }
  };

  const typeConfig = types[type] || types.info;
  const positionConfig = positions[position] || positions['top-center'];

  useEffect(() => {
    // Inject keyframes for toast animations
    const styleId = 'hydrogarden-toast-keyframes';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes hydrogardenToastSlideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        
        @keyframes hydrogardenToastSlideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        
        @keyframes hydrogardenToastSlideLeft {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes hydrogardenToastFadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, autoClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose();
      }
    }, 300);
  };

  if (!isVisible) {
    return null;
  }

  const toastStyle = {
    position: 'fixed',
    ...positionConfig,
    backgroundColor: typeConfig.background,
    color: typeConfig.color,
    padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
    borderRadius: theme.borderRadius.md,
    boxShadow: theme.shadows.lg,
    zIndex: theme.zIndex.toast,
    maxWidth: 400,
    width: 'auto',
    minWidth: 200,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSizes.sm,
    direction: 'rtl',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    animation: isExiting 
      ? `hydrogardenToastFadeOut ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut} forwards`
      : `${positionConfig.animationName} ${theme.transitions.duration.normal} ${theme.transitions.easing.easeOut}`,
    cursor: 'pointer'
  };

  return (
    <div
      style={toastStyle}
      onClick={handleClose}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <span 
        style={{ 
          fontSize: theme.typography.fontSizes.md,
          fontWeight: theme.typography.fontWeights.bold 
        }}
        aria-hidden="true"
      >
        {typeConfig.icon}
      </span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        style={{
          background: 'none',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          fontSize: theme.typography.fontSizes.lg,
          padding: 0,
          marginLeft: theme.spacing.xs
        }}
        aria-label="סגור הודעה"
      >
        ×
      </button>
    </div>
  );
};

// Toast Manager for programmatic usage
export class ToastManager {
  static toasts = [];
  static listeners = [];

  static show(message, type = 'info', options = {}) {
    const toast = {
      id: Date.now() + Math.random(),
      message,
      type,
      ...options
    };

    this.toasts.push(toast);
    this.notifyListeners();

    return toast.id;
  }

  static success(message, options = {}) {
    return this.show(message, 'success', options);
  }

  static error(message, options = {}) {
    return this.show(message, 'error', options);
  }

  static warning(message, options = {}) {
    return this.show(message, 'warning', options);
  }

  static info(message, options = {}) {
    return this.show(message, 'info', options);
  }

  static remove(toastId) {
    this.toasts = this.toasts.filter(toast => toast.id !== toastId);
    this.notifyListeners();
  }

  static clear() {
    this.toasts = [];
    this.notifyListeners();
  }

  static subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  static notifyListeners() {
    this.listeners.forEach(listener => listener(this.toasts));
  }
}

// Toast Container component
export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = ToastManager.subscribe(setToasts);
    return unsubscribe;
  }, []);

  return (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          position={toast.position}
          autoClose={toast.autoClose}
          onClose={() => ToastManager.remove(toast.id)}
        />
      ))}
    </>
  );
};

export default Toast;