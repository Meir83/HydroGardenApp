import React from 'react';
import Modal from './Modal';
import { theme } from '../styles/theme';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'אישור פעולה',
  message = 'האם אתה בטוח שברצונך לבצע פעולה זו?',
  confirmText = 'אישור',
  cancelText = 'ביטול',
  type = 'warning', // 'warning', 'danger', 'info'
  loading = false
}) => {
  const types = {
    warning: {
      color: theme.colors.warning.main,
      backgroundColor: theme.colors.warning.background,
      icon: '⚠️'
    },
    danger: {
      color: theme.colors.error.main,
      backgroundColor: theme.colors.error.background,
      icon: '🗑️'
    },
    info: {
      color: theme.colors.info.main,
      backgroundColor: theme.colors.info.background,
      icon: 'ℹ️'
    }
  };

  const typeConfig = types[type] || types.warning;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Error in confirm action:', error);
      // Don't close dialog on error, let parent handle it
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
    >
      <div style={{ 
        textAlign: 'center',
        padding: `${theme.spacing.md}px 0`
      }}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            backgroundColor: typeConfig.backgroundColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            fontSize: 24
          }}
          aria-hidden="true"
        >
          {typeConfig.icon}
        </div>
        
        <p 
          style={{ 
            color: theme.colors.text.primary,
            fontSize: theme.typography.fontSizes.md,
            lineHeight: theme.typography.lineHeights.relaxed,
            margin: `0 0 ${theme.spacing.lg}px 0`
          }}
        >
          {message}
        </p>
        
        <div 
          style={{ 
            display: 'flex', 
            gap: theme.spacing.sm, 
            justifyContent: 'center',
            flexDirection: 'row-reverse' // RTL button order
          }}
          onKeyDown={handleKeyDown}
        >
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              padding: `${theme.spacing.sm}px ${theme.spacing.lg}px`,
              borderRadius: theme.borderRadius.md,
              border: 'none',
              backgroundColor: type === 'danger' ? theme.colors.error.main : theme.colors.primary.main,
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: theme.typography.fontWeights.medium,
              fontSize: theme.typography.fontSizes.md,
              fontFamily: theme.typography.fontFamily,
              opacity: loading ? 0.7 : 1,
              transition: `all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.xs,
              minWidth: 80
            }}
            aria-label={loading ? 'מבצע פעולה...' : confirmText}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'hydrogardenSpin 1s linear infinite'
                  }}
                  aria-hidden="true"
                />
                מבצע...
              </>
            ) : (
              confirmText
            )}
          </button>
          
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: `${theme.spacing.sm}px ${theme.spacing.lg}px`,
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.grey[300]}`,
              backgroundColor: theme.colors.background.paper,
              color: theme.colors.text.primary,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: theme.typography.fontWeights.medium,
              fontSize: theme.typography.fontSizes.md,
              fontFamily: theme.typography.fontFamily,
              opacity: loading ? 0.5 : 1,
              transition: `all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
              minWidth: 80
            }}
            aria-label={cancelText}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;