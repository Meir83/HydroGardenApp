import React, { useState, useEffect } from 'react';
import { theme } from '../styles/theme';

const AnimatedCard = ({
  children,
  hover = true,
  delay = 0,
  duration = 'normal',
  animationType = 'fadeIn',
  className = '',
  style = {},
  onClick,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const animations = {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: `opacity ${theme.transitions.duration[duration]} ${theme.transitions.easing.easeOut}`
    },
    slideUp: {
      initial: { opacity: 0, transform: 'translateY(20px)' },
      animate: { opacity: 1, transform: 'translateY(0)' },
      transition: `all ${theme.transitions.duration[duration]} ${theme.transitions.easing.easeOut}`
    },
    slideDown: {
      initial: { opacity: 0, transform: 'translateY(-20px)' },
      animate: { opacity: 1, transform: 'translateY(0)' },
      transition: `all ${theme.transitions.duration[duration]} ${theme.transitions.easing.easeOut}`
    },
    slideLeft: {
      initial: { opacity: 0, transform: 'translateX(20px)' },
      animate: { opacity: 1, transform: 'translateX(0)' },
      transition: `all ${theme.transitions.duration[duration]} ${theme.transitions.easing.easeOut}`
    },
    slideRight: {
      initial: { opacity: 0, transform: 'translateX(-20px)' },
      animate: { opacity: 1, transform: 'translateX(0)' },
      transition: `all ${theme.transitions.duration[duration]} ${theme.transitions.easing.easeOut}`
    },
    scale: {
      initial: { opacity: 0, transform: 'scale(0.9)' },
      animate: { opacity: 1, transform: 'scale(1)' },
      transition: `all ${theme.transitions.duration[duration]} ${theme.transitions.easing.easeOut}`
    },
    bounce: {
      initial: { opacity: 0, transform: 'scale(0.3)' },
      animate: { opacity: 1, transform: 'scale(1)' },
      transition: `all ${theme.transitions.duration[duration]} cubic-bezier(0.68, -0.55, 0.265, 1.55)`
    }
  };

  const animation = animations[animationType] || animations.fadeIn;

  const baseStyle = {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
    boxShadow: isHovered && hover ? theme.shadows.md : theme.shadows.sm,
    padding: theme.spacing.md,
    cursor: onClick ? 'pointer' : 'default',
    transform: isHovered && hover ? 'translateY(-2px)' : 'translateY(0)',
    transition: hover 
      ? `all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut}`
      : animation.transition,
    ...animation.initial,
    ...(isVisible ? animation.animate : {}),
    ...style
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const handleMouseEnter = () => {
    if (hover) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (hover) {
      setIsHovered(false);
    }
  };

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  const handleKeyDown = (e) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <div
      className={className}
      style={baseStyle}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? 'button' : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;