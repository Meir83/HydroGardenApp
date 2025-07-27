import React, { forwardRef, useState } from 'react';
import { theme } from '../styles/theme';

const AccessibleInput = forwardRef(({
  label,
  helperText,
  error,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  fullWidth = false,
  startIcon = null,
  endIcon = null,
  id,
  className = '',
  style = {},
  onFocus,
  onBlur,
  onChange,
  value,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xs,
    width: fullWidth ? '100%' : 'auto',
    fontFamily: theme.typography.fontFamily,
    direction: 'rtl',
    ...style
  };

  const labelStyle = {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    color: error ? theme.colors.error.main : theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs
  };

  const inputContainerStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%'
  };

  const inputStyle = {
    border: `2px solid ${
      error 
        ? theme.colors.error.main 
        : isFocused 
          ? theme.colors.primary.main 
          : theme.colors.grey[300]
    }`,
    borderRadius: theme.borderRadius.md,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSizes.md,
    outline: 'none',
    padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
    transition: `all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
    width: '100%',
    backgroundColor: disabled ? theme.colors.grey[100] : theme.colors.background.paper,
    color: disabled ? theme.colors.text.disabled : theme.colors.text.primary,
    cursor: disabled ? 'not-allowed' : 'text',
    direction: 'rtl',
    paddingRight: startIcon ? theme.spacing.xl : theme.spacing.md,
    paddingLeft: endIcon ? theme.spacing.xl : theme.spacing.md,
    '&::placeholder': {
      color: theme.colors.text.hint,
      opacity: 1
    }
  };

  const iconStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    color: error 
      ? theme.colors.error.main 
      : isFocused 
        ? theme.colors.primary.main 
        : theme.colors.text.hint,
    fontSize: theme.typography.fontSizes.lg,
    pointerEvents: 'none',
    transition: `color ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`
  };

  const startIconStyle = {
    ...iconStyle,
    right: theme.spacing.md
  };

  const endIconStyle = {
    ...iconStyle,
    left: theme.spacing.md
  };

  const messageStyle = {
    fontSize: theme.typography.fontSizes.xs,
    color: error ? theme.colors.error.main : theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
    lineHeight: theme.typography.lineHeights.normal,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(e);
    }
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className={className} style={containerStyle}>
      {label && (
        <label htmlFor={inputId} style={labelStyle}>
          {label}
          {required && (
            <span 
              style={{ color: theme.colors.error.main }}
              aria-label="שדה חובה"
            >
              *
            </span>
          )}
        </label>
      )}
      
      <div style={inputContainerStyle}>
        {startIcon && (
          <span style={startIconStyle} aria-hidden="true">
            {startIcon}
          </span>
        )}
        
        <input
          ref={ref}
          id={inputId}
          type={type}
          value={value}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          style={inputStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          aria-describedby={[helperId, errorId].filter(Boolean).join(' ')}
          aria-invalid={error ? 'true' : 'false'}
          aria-required={required}
          {...props}
        />
        
        {endIcon && (
          <span style={endIconStyle} aria-hidden="true">
            {endIcon}
          </span>
        )}
      </div>
      
      {(helperText || error) && (
        <div
          id={errorId || helperId}
          style={messageStyle}
          role={error ? 'alert' : 'note'}
          aria-live={error ? 'assertive' : 'polite'}
        >
          {error && (
            <span aria-hidden="true" style={{ fontSize: '1.1em' }}>
              ⚠️
            </span>
          )}
          {error || helperText}
        </div>
      )}
    </div>
  );
});

AccessibleInput.displayName = 'AccessibleInput';

export default AccessibleInput;