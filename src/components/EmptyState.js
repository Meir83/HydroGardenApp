import React from 'react';
import { theme } from '../styles/theme';

const EmptyState = ({
  icon = '📋',
  title = 'אין נתונים להצגה',
  description = 'כאשר תוסיף פריטים, הם יופיעו כאן',
  actionText = null,
  onAction = null,
  illustration = null,
  size = 'medium' // 'small', 'medium', 'large'
}) => {
  const sizes = {
    small: {
      container: { padding: theme.spacing.md },
      icon: { fontSize: 32, marginBottom: theme.spacing.sm },
      title: { fontSize: theme.typography.fontSizes.md, marginBottom: theme.spacing.xs },
      description: { fontSize: theme.typography.fontSizes.sm },
      button: { padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`, fontSize: theme.typography.fontSizes.sm }
    },
    medium: {
      container: { padding: theme.spacing.lg },
      icon: { fontSize: 48, marginBottom: theme.spacing.md },
      title: { fontSize: theme.typography.fontSizes.lg, marginBottom: theme.spacing.sm },
      description: { fontSize: theme.typography.fontSizes.md },
      button: { padding: `${theme.spacing.sm}px ${theme.spacing.md}px`, fontSize: theme.typography.fontSizes.md }
    },
    large: {
      container: { padding: theme.spacing.xl },
      icon: { fontSize: 64, marginBottom: theme.spacing.lg },
      title: { fontSize: theme.typography.fontSizes.xl, marginBottom: theme.spacing.md },
      description: { fontSize: theme.typography.fontSizes.lg },
      button: { padding: `${theme.spacing.md}px ${theme.spacing.lg}px`, fontSize: theme.typography.fontSizes.md }
    }
  };

  const currentSize = sizes[size] || sizes.medium;

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily,
    direction: 'rtl',
    minHeight: 200,
    ...currentSize.container
  };

  const iconStyle = {
    display: 'block',
    opacity: 0.7,
    ...currentSize.icon
  };

  const titleStyle = {
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeights.medium,
    margin: 0,
    ...currentSize.title
  };

  const descriptionStyle = {
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeights.relaxed,
    margin: `${theme.spacing.sm}px 0 ${theme.spacing.md}px 0`,
    maxWidth: 300,
    ...currentSize.description
  };

  const buttonStyle = {
    backgroundColor: theme.colors.primary.main,
    color: theme.colors.primary.contrast,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeights.medium,
    transition: `all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut}`,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
    ...currentSize.button,
    '&:hover': {
      backgroundColor: theme.colors.primary.dark,
      transform: 'translateY(-1px)',
      boxShadow: theme.shadows.md
    },
    '&:focus': {
      outline: 'none',
      boxShadow: `0 0 0 3px ${theme.colors.primary.light}40`
    }
  };

  return (
    <div style={containerStyle} role="status" aria-label="אין תוכן להצגה">
      {illustration ? (
        <div style={{ marginBottom: theme.spacing.md }}>
          {illustration}
        </div>
      ) : (
        <div style={iconStyle} aria-hidden="true">
          {icon}
        </div>
      )}
      
      <h3 style={titleStyle}>
        {title}
      </h3>
      
      {description && (
        <p style={descriptionStyle}>
          {description}
        </p>
      )}
      
      {actionText && onAction && (
        <button
          onClick={onAction}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = theme.colors.primary.dark;
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = theme.shadows.md;
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = theme.colors.primary.main;
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
          aria-label={actionText}
        >
          <span style={{ fontSize: '1.2em' }}>+</span>
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;