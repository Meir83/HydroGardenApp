import React, { useState, useEffect } from 'react';
import { theme } from '../styles/theme';

const PageTransition = ({
  children,
  isVisible = true,
  transitionType = 'fade',
  duration = 'normal',
  className = '',
  style = {}
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [animationState, setAnimationState] = useState(isVisible ? 'entered' : 'exited');

  const durations = {
    fast: 150,
    normal: 250,
    slow: 350
  };

  const transitionDuration = durations[duration] || durations.normal;

  const transitions = {
    fade: {
      entering: { opacity: 0 },
      entered: { opacity: 1 },
      exiting: { opacity: 0 },
      exited: { opacity: 0 }
    },
    slideUp: {
      entering: { opacity: 0, transform: 'translateY(30px)' },
      entered: { opacity: 1, transform: 'translateY(0)' },
      exiting: { opacity: 0, transform: 'translateY(-30px)' },
      exited: { opacity: 0, transform: 'translateY(-30px)' }
    },
    slideDown: {
      entering: { opacity: 0, transform: 'translateY(-30px)' },
      entered: { opacity: 1, transform: 'translateY(0)' },
      exiting: { opacity: 0, transform: 'translateY(30px)' },
      exited: { opacity: 0, transform: 'translateY(30px)' }
    },
    slideLeft: {
      entering: { opacity: 0, transform: 'translateX(30px)' },
      entered: { opacity: 1, transform: 'translateX(0)' },
      exiting: { opacity: 0, transform: 'translateX(-30px)' },
      exited: { opacity: 0, transform: 'translateX(-30px)' }
    },
    slideRight: {
      entering: { opacity: 0, transform: 'translateX(-30px)' },
      entered: { opacity: 1, transform: 'translateX(0)' },
      exiting: { opacity: 0, transform: 'translateX(30px)' },
      exited: { opacity: 0, transform: 'translateX(30px)' }
    },
    scale: {
      entering: { opacity: 0, transform: 'scale(0.9)' },
      entered: { opacity: 1, transform: 'scale(1)' },
      exiting: { opacity: 0, transform: 'scale(1.1)' },
      exited: { opacity: 0, transform: 'scale(1.1)' }
    }
  };

  const currentTransition = transitions[transitionType] || transitions.fade;

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setAnimationState('entering');
      
      // Use requestAnimationFrame to ensure the entering state is applied before transitioning to entered
      requestAnimationFrame(() => {
        setAnimationState('entered');
      });
    } else {
      setAnimationState('exiting');
      
      // Remove from DOM after exit animation completes
      const timer = setTimeout(() => {
        setShouldRender(false);
        setAnimationState('exited');
      }, transitionDuration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, transitionDuration]);

  if (!shouldRender) {
    return null;
  }

  const containerStyle = {
    transition: `all ${transitionDuration}ms ${theme.transitions.easing.easeInOut}`,
    ...currentTransition[animationState],
    ...style
  };

  return (
    <div 
      className={className}
      style={containerStyle}
      aria-hidden={!isVisible}
    >
      {children}
    </div>
  );
};

// Hook for managing page transitions
export const usePageTransition = (initialVisible = false) => {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const show = () => {
    setIsTransitioning(true);
    setIsVisible(true);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 250);
  };

  const hide = () => {
    setIsTransitioning(true);
    setIsVisible(false);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 250);
  };

  const toggle = () => {
    if (isVisible) {
      hide();
    } else {
      show();
    }
  };

  return {
    isVisible,
    isTransitioning,
    show,
    hide,
    toggle
  };
};

export default PageTransition;