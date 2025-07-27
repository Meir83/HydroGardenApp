import React, { forwardRef } from 'react';
import { theme } from '../styles/theme';
import LoadingSpinner from './LoadingSpinner';

const AccessibleButton = forwardRef(({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  startIcon = null,
  endIcon = null,
  onClick,
  type = 'button',
  ariaLabel,
  ariaDescribedBy,
  className = '',
  style = {},
  ...props
}, ref) => {
  const variants = {
    primary: {
      backgroundColor: theme.colors.primary.main,
      color: theme.colors.primary.contrast,
      border: 'none',
      '&:hover': {
        backgroundColor: theme.colors.primary.dark
      },
      '&:focus': {
        boxShadow: `0 0 0 3px ${theme.colors.primary.light}40`
      }
    },
    secondary: {
      backgroundColor: theme.colors.secondary.main,
      color: theme.colors.secondary.contrast,
      border: 'none',
      '&:hover': {
        backgroundColor: theme.colors.secondary.dark
      },
      '&:focus': {
        boxShadow: `0 0 0 3px ${theme.colors.secondary.light}40`
      }
    },
    outline: {
      backgroundColor: 'transparent',
      color: theme.colors.primary.main,
      border: `2px solid ${theme.colors.primary.main}`,
      '&:hover': {
        backgroundColor: theme.colors.primary.main,
        color: theme.colors.primary.contrast
      },
      '&:focus': {
        boxShadow: `0 0 0 3px ${theme.colors.primary.light}40`
      }
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.colors.primary.main,
      border: 'none',
      '&:hover': {
        backgroundColor: theme.colors.grey[100]
      },
      '&:focus': {
        boxShadow: `0 0 0 3px ${theme.colors.primary.light}40`
      }
    },
    danger: {
      backgroundColor: theme.colors.error.main,
      color: theme.colors.error.contrast,
      border: 'none',
      '&:hover': {
        backgroundColor: theme.colors.error.dark
      },
      '&:focus': {
        boxShadow: `0 0 0 3px ${theme.colors.error.light}40`
      }
    }
  };

  const sizes = {
    small: {
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      fontSize: theme.typography.fontSizes.sm,
      minHeight: 32
    },
    medium: {
      padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
      fontSize: theme.typography.fontSizes.md,
      minHeight: 40
    },
    large: {
      padding: `${theme.spacing.md}px ${theme.spacing.lg}px`,
      fontSize: theme.typography.fontSizes.lg,
      minHeight: 48
    }
  };

  const variantStyle = variants[variant] || variants.primary;
  const sizeStyle = sizes[size] || sizes.medium;

  const baseStyle = {
    borderRadius: theme.borderRadius.md,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeights.medium,
    outline: 'none',
    transition: `all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    textDecoration: 'none',
    userSelect: 'none',
    verticalAlign: 'middle',
    position: 'relative',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.6 : 1,
    ...variantStyle,
    ...sizeStyle,
    ...style
  };

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  const handleKeyDown = (e) => {
    // Enhanced keyboard support
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  const getAriaLabel = () => {
    if (ariaLabel) return ariaLabel;
    if (loading) return 'טוען...';
    if (disabled) return `${children} - מושבת`;
    return undefined;
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={className}
      style={baseStyle}
      aria-label={getAriaLabel()}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      onMouseEnter={(e) => {
        if (!disabled && !loading && variantStyle['&:hover']) {
          Object.assign(e.target.style, variantStyle['&:hover']);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.target.style.backgroundColor = variantStyle.backgroundColor;
          e.target.style.color = variantStyle.color;
        }
      }}
      onFocus={(e) => {
        if (variantStyle['&:focus']) {
          Object.assign(e.target.style, variantStyle['&:focus']);
        }
      }}
      onBlur={(e) => {
        e.target.style.boxShadow = 'none';
      }}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size="small" color="white" />
          <span style={{ marginLeft: theme.spacing.xs }}>טוען...</span>
        </>
      ) : (
        <>
          {startIcon && (
            <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center' }}>
              {startIcon}
            </span>
          )}
          {children}
          {endIcon && (
            <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center' }}>
              {endIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
});

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;