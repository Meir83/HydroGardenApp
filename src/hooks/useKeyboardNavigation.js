import { useEffect, useRef } from 'react';

/**
 * Custom hook for enhanced keyboard navigation
 * Supports arrow keys, Enter, Escape, and tab trapping
 */
export const useKeyboardNavigation = ({
  containerRef,
  items = [],
  onSelect,
  onEscape,
  initialFocus = 0,
  loop = true,
  trapFocus = false
}) => {
  const currentFocusIndex = useRef(initialFocus);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e) => {
      const focusableElements = container.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
      );
      
      const focusableArray = Array.from(focusableElements);
      
      if (focusableArray.length === 0) return;

      const currentIndex = focusableArray.indexOf(document.activeElement);
      let newIndex = currentIndex;

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          newIndex = currentIndex + 1;
          if (newIndex >= focusableArray.length) {
            newIndex = loop ? 0 : focusableArray.length - 1;
          }
          break;

        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          newIndex = currentIndex - 1;
          if (newIndex < 0) {
            newIndex = loop ? focusableArray.length - 1 : 0;
          }
          break;

        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;

        case 'End':
          e.preventDefault();
          newIndex = focusableArray.length - 1;
          break;

        case 'Enter':
        case ' ':
          if (onSelect && document.activeElement) {
            e.preventDefault();
            onSelect(document.activeElement, currentIndex);
          }
          break;

        case 'Escape':
          if (onEscape) {
            e.preventDefault();
            onEscape();
          }
          break;

        case 'Tab':
          if (trapFocus) {
            e.preventDefault();
            newIndex = e.shiftKey ? currentIndex - 1 : currentIndex + 1;
            if (newIndex >= focusableArray.length) newIndex = 0;
            if (newIndex < 0) newIndex = focusableArray.length - 1;
          }
          break;

        default:
          return;
      }

      if (newIndex !== currentIndex && focusableArray[newIndex]) {
        focusableArray[newIndex].focus();
        currentFocusIndex.current = newIndex;
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [onSelect, onEscape, loop, trapFocus]);

  // Focus the initial element when component mounts
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    );

    if (focusableElements[initialFocus]) {
      focusableElements[initialFocus].focus();
    }
  }, [initialFocus]);

  return {
    currentFocusIndex: currentFocusIndex.current
  };
};

/**
 * Hook for managing focus within modals and overlays
 */
export const useFocusTrap = (isActive = true) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element when trap becomes active
    if (firstElement) {
      firstElement.focus();
    }

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
};

/**
 * Hook for managing ARIA live announcements
 */
export const useAriaLive = () => {
  const announceRef = useRef(null);

  useEffect(() => {
    // Create aria-live region if it doesn't exist
    if (!announceRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      
      document.body.appendChild(liveRegion);
      announceRef.current = liveRegion;
    }

    return () => {
      if (announceRef.current && announceRef.current.parentNode) {
        announceRef.current.parentNode.removeChild(announceRef.current);
      }
    };
  }, []);

  const announce = (message, priority = 'polite') => {
    if (announceRef.current) {
      announceRef.current.setAttribute('aria-live', priority);
      announceRef.current.textContent = message;
    }
  };

  return { announce };
};

export default {
  useKeyboardNavigation,
  useFocusTrap,
  useAriaLive
};