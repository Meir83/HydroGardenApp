import React, { useState, useRef, useEffect } from 'react';
import { theme } from '../styles/theme';

const Tooltip = ({
  children,
  content,
  placement = 'top',
  trigger = 'hover', // 'hover', 'click', 'focus'
  delay = 200,
  disabled = false,
  maxWidth = 250
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Inject tooltip styles
    const styleId = 'hydrogarden-tooltip-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .hydrogarden-tooltip-enter {
          opacity: 0;
          transform: scale(0.8);
        }
        .hydrogarden-tooltip-enter-active {
          opacity: 1;
          transform: scale(1);
          transition: opacity ${theme.transitions.duration.normal} ${theme.transitions.easing.easeOut},
                      transform ${theme.transitions.duration.normal} ${theme.transitions.easing.easeOut};
        }
        .hydrogarden-tooltip-exit {
          opacity: 1;
          transform: scale(1);
        }
        .hydrogarden-tooltip-exit-active {
          opacity: 0;
          transform: scale(0.8);
          transition: opacity ${theme.transitions.duration.fast} ${theme.transitions.easing.easeIn},
                      transform ${theme.transitions.duration.fast} ${theme.transitions.easing.easeIn};
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let top, left;

    switch (placement) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.right + 8;
        break;
      default:
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
    }

    // Boundary checks
    if (left < 8) left = 8;
    if (left + tooltipRect.width > viewport.width - 8) {
      left = viewport.width - tooltipRect.width - 8;
    }
    if (top < 8) top = triggerRect.bottom + 8;
    if (top + tooltipRect.height > viewport.height - 8) {
      top = triggerRect.top - tooltipRect.height - 8;
    }

    setPosition({ top, left });
  };

  const showTooltip = () => {
    if (disabled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Calculate position after tooltip is rendered
      setTimeout(calculatePosition, 0);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      showTooltip();
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      hideTooltip();
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      if (isVisible) {
        hideTooltip();
      } else {
        showTooltip();
      }
    }
  };

  const handleFocus = () => {
    if (trigger === 'focus') {
      showTooltip();
    }
  };

  const handleBlur = () => {
    if (trigger === 'focus') {
      hideTooltip();
    }
  };

  const getArrowStyle = () => {
    const arrowSize = 6;
    const arrowStyle = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid'
    };

    switch (placement) {
      case 'top':
        return {
          ...arrowStyle,
          bottom: -arrowSize,
          left: '50%',
          marginLeft: -arrowSize,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent',
          borderTopColor: theme.colors.grey[800],
          borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`
        };
      case 'bottom':
        return {
          ...arrowStyle,
          top: -arrowSize,
          left: '50%',
          marginLeft: -arrowSize,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: 'transparent',
          borderBottomColor: theme.colors.grey[800],
          borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`
        };
      case 'left':
        return {
          ...arrowStyle,
          top: '50%',
          right: -arrowSize,
          marginTop: -arrowSize,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderRightColor: 'transparent',
          borderLeftColor: theme.colors.grey[800],
          borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`
        };
      case 'right':
        return {
          ...arrowStyle,
          top: '50%',
          left: -arrowSize,
          marginTop: -arrowSize,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: 'transparent',
          borderRightColor: theme.colors.grey[800],
          borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`
        };
      default:
        return arrowStyle;
    }
  };

  const tooltipStyle = {
    position: 'fixed',
    top: position.top,
    left: position.left,
    zIndex: theme.zIndex.tooltip,
    backgroundColor: theme.colors.grey[800],
    color: 'white',
    padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
    borderRadius: theme.borderRadius.sm,
    fontSize: theme.typography.fontSizes.sm,
    fontFamily: theme.typography.fontFamily,
    maxWidth: maxWidth,
    wordWrap: 'break-word',
    boxShadow: theme.shadows.md,
    direction: 'rtl',
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.normal,
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'scale(1)' : 'scale(0.8)',
    transition: `opacity ${theme.transitions.duration.normal} ${theme.transitions.easing.easeOut}, transform ${theme.transitions.duration.normal} ${theme.transitions.easing.easeOut}`,
    pointerEvents: isVisible ? 'auto' : 'none'
  };

  useEffect(() => {
    // Handle clicks outside for click trigger
    const handleClickOutside = (event) => {
      if (trigger === 'click' && 
          triggerRef.current && 
          !triggerRef.current.contains(event.target) &&
          tooltipRef.current &&
          !tooltipRef.current.contains(event.target)) {
        hideTooltip();
      }
    };

    if (isVisible && trigger === 'click') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, trigger]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{ display: 'inline-block' }}
        aria-describedby={isVisible ? 'hydrogarden-tooltip' : undefined}
      >
        {children}
      </span>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          id="hydrogarden-tooltip"
          role="tooltip"
          style={tooltipStyle}
          aria-live="polite"
        >
          {content}
          <div style={getArrowStyle()} aria-hidden="true" />
        </div>
      )}
    </>
  );
};

export default Tooltip;