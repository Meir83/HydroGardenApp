import { theme } from './theme';

/**
 * Responsive utilities for mobile-first design
 */

// Media query helpers
export const mediaQueries = {
  mobile: `@media (max-width: ${theme.breakpoints.mobile})`,
  tablet: `@media (max-width: ${theme.breakpoints.tablet})`,
  desktop: `@media (min-width: ${theme.breakpoints.desktop})`,
  wide: `@media (min-width: ${theme.breakpoints.wide})`,
  
  // Touch devices
  touch: '@media (hover: none) and (pointer: coarse)',
  
  // High resolution displays
  retina: '@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 2dppx)',
  
  // Reduced motion preference
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
  
  // Dark mode preference
  darkMode: '@media (prefers-color-scheme: dark)'
};

// Responsive grid system
export const grid = {
  container: (maxWidth = theme.breakpoints.wide) => ({
    width: '100%',
    maxWidth: maxWidth,
    margin: '0 auto',
    padding: `0 ${theme.spacing.md}px`,
    [mediaQueries.mobile]: {
      padding: `0 ${theme.spacing.sm}px`
    }
  }),
  
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    margin: `0 -${theme.spacing.sm}px`,
    [mediaQueries.mobile]: {
      margin: `0 -${theme.spacing.xs}px`
    }
  },
  
  col: (size = 12, offset = 0) => ({
    flex: `0 0 ${(size / 12) * 100}%`,
    maxWidth: `${(size / 12) * 100}%`,
    padding: `0 ${theme.spacing.sm}px`,
    marginLeft: offset > 0 ? `${(offset / 12) * 100}%` : '0',
    [mediaQueries.mobile]: {
      flex: '0 0 100%',
      maxWidth: '100%',
      marginLeft: '0',
      padding: `0 ${theme.spacing.xs}px`
    }
  })
};

// Responsive typography
export const typography = {
  heading1: {
    fontSize: theme.typography.fontSizes.huge,
    fontWeight: theme.typography.fontWeights.bold,
    lineHeight: theme.typography.lineHeights.tight,
    [mediaQueries.mobile]: {
      fontSize: theme.typography.fontSizes.xxl
    }
  },
  
  heading2: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.semibold,
    lineHeight: theme.typography.lineHeights.tight,
    [mediaQueries.mobile]: {
      fontSize: theme.typography.fontSizes.xl
    }
  },
  
  heading3: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.semibold,
    lineHeight: theme.typography.lineHeights.normal,
    [mediaQueries.mobile]: {
      fontSize: theme.typography.fontSizes.lg
    }
  },
  
  body: {
    fontSize: theme.typography.fontSizes.md,
    lineHeight: theme.typography.lineHeights.relaxed,
    [mediaQueries.mobile]: {
      fontSize: theme.typography.fontSizes.sm
    }
  },
  
  caption: {
    fontSize: theme.typography.fontSizes.sm,
    lineHeight: theme.typography.lineHeights.normal,
    [mediaQueries.mobile]: {
      fontSize: theme.typography.fontSizes.xs
    }
  }
};

// Responsive spacing
export const spacing = {
  section: {
    padding: `${theme.spacing.xl}px 0`,
    [mediaQueries.mobile]: {
      padding: `${theme.spacing.lg}px 0`
    }
  },
  
  container: {
    padding: `0 ${theme.spacing.lg}px`,
    [mediaQueries.mobile]: {
      padding: `0 ${theme.spacing.md}px`
    }
  },
  
  gap: {
    large: theme.spacing.lg,
    medium: theme.spacing.md,
    small: theme.spacing.sm,
    [mediaQueries.mobile]: {
      large: theme.spacing.md,
      medium: theme.spacing.sm,
      small: theme.spacing.xs
    }
  }
};

// Touch-friendly styles
export const touchFriendly = {
  minTouchTarget: {
    minHeight: '44px',
    minWidth: '44px',
    [mediaQueries.touch]: {
      minHeight: '48px',
      minWidth: '48px'
    }
  },
  
  button: {
    padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
    minHeight: '44px',
    [mediaQueries.touch]: {
      padding: `${theme.spacing.md}px ${theme.spacing.lg}px`,
      minHeight: '48px'
    }
  },
  
  input: {
    padding: theme.spacing.sm,
    minHeight: '44px',
    fontSize: theme.typography.fontSizes.md,
    [mediaQueries.touch]: {
      padding: theme.spacing.md,
      minHeight: '48px',
      fontSize: theme.typography.fontSizes.lg
    }
  }
};

// Layout helpers
export const layout = {
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  flexBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  
  flexColumn: {
    display: 'flex',
    flexDirection: 'column'
  },
  
  hidden: {
    [mediaQueries.mobile]: {
      display: 'none'
    }
  },
  
  mobileOnly: {
    display: 'none',
    [mediaQueries.mobile]: {
      display: 'block'
    }
  },
  
  desktopOnly: {
    display: 'block',
    [mediaQueries.mobile]: {
      display: 'none'
    }
  }
};

// Card layouts
export const cardLayouts = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: theme.spacing.lg,
    [mediaQueries.tablet]: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: theme.spacing.md
    },
    [mediaQueries.mobile]: {
      gridTemplateColumns: '1fr',
      gap: theme.spacing.sm
    }
  },
  
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
    [mediaQueries.mobile]: {
      gap: theme.spacing.sm
    }
  }
};

// Navigation styles
export const navigation = {
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background.paper,
    borderTop: `1px solid ${theme.colors.grey[200]}`,
    boxShadow: theme.shadows.lg,
    zIndex: theme.zIndex.sticky,
    display: 'flex',
    justifyContent: 'space-around',
    padding: `${theme.spacing.xs}px 0`,
    [mediaQueries.mobile]: {
      padding: `${theme.spacing.sm}px 0`
    }
  },
  
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing.xs,
    textDecoration: 'none',
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSizes.xs,
    transition: `color ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
    minWidth: '60px',
    ...touchFriendly.minTouchTarget,
    '&.active': {
      color: theme.colors.primary.main
    },
    '&:hover': {
      color: theme.colors.primary.main
    }
  }
};

// Animation utilities that respect reduced motion
export const animations = {
  fadeIn: {
    opacity: 0,
    animation: 'fadeIn 0.3s ease-out forwards',
    [mediaQueries.reducedMotion]: {
      animation: 'none',
      opacity: 1
    }
  },
  
  slideUp: {
    transform: 'translateY(20px)',
    opacity: 0,
    animation: 'slideUp 0.3s ease-out forwards',
    [mediaQueries.reducedMotion]: {
      animation: 'none',
      transform: 'none',
      opacity: 1
    }
  },
  
  scale: {
    transform: 'scale(0.9)',
    opacity: 0,
    animation: 'scaleIn 0.3s ease-out forwards',
    [mediaQueries.reducedMotion]: {
      animation: 'none',
      transform: 'none',
      opacity: 1
    }
  }
};

// Utility function to apply responsive styles
export const applyResponsiveStyles = (baseStyles, responsiveStyles) => {
  const styles = { ...baseStyles };
  
  Object.entries(responsiveStyles).forEach(([breakpoint, breakpointStyles]) => {
    if (mediaQueries[breakpoint]) {
      styles[mediaQueries[breakpoint]] = breakpointStyles;
    }
  });
  
  return styles;
};

// Hook to detect mobile device
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= parseInt(theme.breakpoints.mobile));
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  return isMobile;
};

export default {
  mediaQueries,
  grid,
  typography,
  spacing,
  touchFriendly,
  layout,
  cardLayouts,
  navigation,
  animations,
  applyResponsiveStyles,
  useIsMobile
};