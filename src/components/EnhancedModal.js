import React, { useEffect } from 'react';
import { theme } from '../styles/theme';
import { useFocusTrap } from '../hooks/useKeyboardNavigation';
import PageTransition from './PageTransition';

const EnhancedModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
  style = {}
}) => {
  const focusTrapRef = useFocusTrap(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    // Inject modal animations
    const styleId = 'hydrogarden-modal-animations';
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = `
        @keyframes hydrogardenModalBackdropFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes hydrogardenModalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes hydrogardenModalSlideOut {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
        }
      `;
      document.head.appendChild(styleElement);
    }

    // Prevent body scroll when modal is open
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    
    // Calculate scrollbar width
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    // Handle escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  const sizes = {
    small: { maxWidth: 320, width: '90%' },
    medium: { maxWidth: 500, width: '90%' },
    large: { maxWidth: 800, width: '95%' },
    xlarge: { maxWidth: 1200, width: '95%' },
    fullscreen: { 
      maxWidth: '100vw', 
      width: '100vw', 
      height: '100vh', 
      margin: 0,
      borderRadius: 0
    }
  };

  const currentSize = sizes[size] || sizes.medium;

  const backdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: theme.zIndex.modal,
    direction: 'rtl',
    fontFamily: theme.typography.fontFamily,
    padding: size === 'fullscreen' ? 0 : theme.spacing.md,
    animation: 'hydrogardenModalBackdropFadeIn 0.3s ease-out'
  };

  const modalStyle = {
    backgroundColor: theme.colors.background.paper,
    borderRadius: size === 'fullscreen' ? 0 : theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...currentSize,
    maxHeight: size === 'fullscreen' ? '100vh' : '90vh',
    overflow: 'auto',
    boxShadow: theme.shadows.xl,
    animation: 'hydrogardenModalSlideIn 0.3s ease-out',
    border: `1px solid ${theme.colors.grey[200]}`,
    ...style
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    borderBottom: title ? `1px solid ${theme.colors.grey[200]}` : 'none'
  };

  const titleStyle = {
    margin: 0,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: theme.typography.fontSizes.xl,
    cursor: 'pointer',
    padding: theme.spacing.xs,
    color: theme.colors.text.secondary,
    borderRadius: theme.borderRadius.sm,
    transition: `all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    '&:hover': {
      backgroundColor: theme.colors.grey[100],
      color: theme.colors.text.primary
    },
    '&:focus': {
      outline: `2px solid ${theme.colors.primary.main}`,
      outlineOffset: '2px'
    }
  };

  return (
    <PageTransition
      isVisible={isOpen}
      transitionType="fade"
      duration="fast"
    >
      <div 
        style={backdropStyle}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={className}
      >
        <div
          ref={focusTrapRef}
          style={modalStyle}
          role="document"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
        >
          <div style={headerStyle}>
            {title && (
              <h3 
                id="modal-title"
                style={titleStyle}
              >
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                style={closeButtonStyle}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = theme.colors.grey[100];
                  e.target.style.color = theme.colors.text.primary;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = theme.colors.text.secondary;
                }}
                onFocus={(e) => {
                  e.target.style.outline = `2px solid ${theme.colors.primary.main}`;
                  e.target.style.outlineOffset = '2px';
                }}
                onBlur={(e) => {
                  e.target.style.outline = 'none';
                }}
                aria-label="סגור דיאלוג"
                type="button"
              >
                ×
              </button>
            )}
          </div>
          
          <div style={{ 
            maxHeight: title ? 'calc(90vh - 120px)' : 'calc(90vh - 80px)',
            overflow: 'auto'
          }}>
            {children}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default EnhancedModal;