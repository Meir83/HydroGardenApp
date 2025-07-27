/**
 * Centralized design system and theme for HydroGarden app
 * Provides consistent colors, typography, spacing, and shadows
 */

export const theme = {
  colors: {
    primary: {
      main: '#2e7d32',
      light: '#66bb6a',
      dark: '#1b5e20',
      contrast: '#ffffff'
    },
    secondary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#0d47a1',
      contrast: '#ffffff'
    },
    accent: {
      main: '#f57c00',
      light: '#ffb74d',
      dark: '#e65100',
      contrast: '#ffffff'
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
      background: '#e8f5e8',
      border: '#c8e6c9'
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
      background: '#fff3e0',
      border: '#ffcc02'
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
      background: '#ffebee',
      border: '#ffcdd2'
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
      background: '#e3f2fd',
      border: '#bbdefb'
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121'
    },
    background: {
      default: '#f9f9f9',
      paper: '#ffffff',
      elevated: '#ffffff'
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#bdbdbd',
      hint: '#9e9e9e'
    },
    divider: '#e0e0e0'
  },

  typography: {
    fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
    fontSizeBase: 16,
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      huge: 32
    },
    fontWeights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6
    }
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    huge: 48
  },

  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999
  },

  shadows: {
    none: 'none',
    sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    md: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    lg: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
    xl: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
    inset: 'inset 0 2px 4px rgba(0,0,0,0.06)'
  },

  transitions: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms'
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
    }
  },

  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1200px'
  },

  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800
  }
};

// Helper functions for common style patterns
export const styleHelpers = {
  // Create responsive font size
  responsiveFont: (baseSize, scale = 0.8) => ({
    fontSize: baseSize,
    [`@media (max-width: ${theme.breakpoints.mobile})`]: {
      fontSize: baseSize * scale
    }
  }),

  // Create button styles
  buttonBase: {
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeights.medium,
    outline: 'none',
    padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
    transition: `all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    userSelect: 'none',
    '&:focus': {
      boxShadow: `0 0 0 3px ${theme.colors.primary.light}40`
    }
  },

  // Create card styles
  card: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.sm,
    padding: theme.spacing.md,
    transition: `box-shadow ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut}`
  },

  // Create input styles
  input: {
    border: `1px solid ${theme.colors.grey[300]}`,
    borderRadius: theme.borderRadius.sm,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSizes.md,
    outline: 'none',
    padding: theme.spacing.sm,
    transition: `border-color ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
    width: '100%',
    '&:focus': {
      borderColor: theme.colors.primary.main,
      boxShadow: `0 0 0 2px ${theme.colors.primary.light}40`
    },
    '&:disabled': {
      backgroundColor: theme.colors.grey[100],
      color: theme.colors.text.disabled,
      cursor: 'not-allowed'
    }
  },

  // RTL support
  rtl: {
    direction: 'rtl',
    textAlign: 'right'
  },

  // Accessibility helpers
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: '1px',
    margin: '-1px',
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    width: '1px'
  },

  // Focus visible for better accessibility
  focusVisible: {
    '&:focus:not(:focus-visible)': {
      outline: 'none'
    },
    '&:focus-visible': {
      outline: `2px solid ${theme.colors.primary.main}`,
      outlineOffset: '2px'
    }
  }
};

export default theme;