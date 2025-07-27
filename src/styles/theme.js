/**
 * Centralized design system and theme for HydroGarden app
 * Provides consistent colors, typography, spacing, and shadows
 */

export const theme = {
  colors: {
    primary: {
      50: '#f0f9f0',
      100: '#e0f2e0',
      200: '#c2e5c2',
      300: '#a3d8a3',
      400: '#85cb85',
      500: '#4CAF50',
      600: '#43A047',
      700: '#388E3C',
      800: '#2E7D32',
      900: '#1B5E20',
      main: '#4CAF50'
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      main: '#64748b'
    },
    accent: {
      blue: '#3B82F6',
      orange: '#F97316',
      purple: '#8B5CF6',
      yellow: '#EAB308',
      red: '#EF4444'
    },
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9'
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#64748b'
    }
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },
  
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px'
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
  },
  
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['Monaco', 'Consolas', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    }
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px'
  }
};

// Component-specific styles
export const componentStyles = {
  card: {
    background: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
    padding: theme.spacing.lg,
    border: `1px solid ${theme.colors.secondary[200]}`,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      boxShadow: theme.shadows.lg,
      transform: 'translateY(-2px)'
    }
  },
  
  button: {
    primary: {
      backgroundColor: theme.colors.primary.main,
      color: theme.colors.background.primary,
      border: 'none',
      borderRadius: theme.borderRadius.md,
      padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
      fontSize: theme.typography.fontSize.base,
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: theme.colors.primary[600],
        transform: 'translateY(-1px)',
        boxShadow: theme.shadows.md
      },
      '&:active': {
        transform: 'translateY(0)',
        boxShadow: theme.shadows.sm
      },
      '&:disabled': {
        backgroundColor: theme.colors.secondary[300],
        cursor: 'not-allowed',
        transform: 'none',
        boxShadow: 'none'
      }
    },
    
    secondary: {
      backgroundColor: 'transparent',
      color: theme.colors.primary.main,
      border: `2px solid ${theme.colors.primary.main}`,
      borderRadius: theme.borderRadius.md,
      padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
      fontSize: theme.typography.fontSize.base,
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: theme.colors.primary.main,
        color: theme.colors.background.primary,
        transform: 'translateY(-1px)',
        boxShadow: theme.shadows.md
      }
    }
  },
  
  input: {
    backgroundColor: theme.colors.background.primary,
    border: `2px solid ${theme.colors.secondary[200]}`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    outline: 'none',
    transition: 'all 0.2s ease-in-out',
    '&:focus': {
      borderColor: theme.colors.primary.main,
      boxShadow: `0 0 0 3px ${theme.colors.primary[100]}`
    },
    '&::placeholder': {
      color: theme.colors.text.tertiary
    }
  },
  
  navigation: {
    backgroundColor: theme.colors.background.primary,
    borderBottom: `1px solid ${theme.colors.secondary[200]}`,
    boxShadow: theme.shadows.sm,
    padding: `${theme.spacing.sm} 0`
  },
  
  modal: {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    },
    content: {
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.xl,
      padding: theme.spacing.xl,
      maxWidth: '90vw',
      maxHeight: '90vh',
      overflow: 'auto',
      position: 'relative'
    }
  },
  
  accessibility: {
    '&:focus-visible': {
      outline: `2px solid ${theme.colors.primary.main}`,
      outlineOffset: '2px'
    }
  }
};

export default theme;