import React, { useState, memo, useCallback } from 'react';
import Modal from './Modal';
import AccessibleInput from './AccessibleInput';
import AccessibleButton from './AccessibleButton';
import { theme } from '../styles/theme';
import { useFocusTrap, useAriaLive } from '../hooks/useKeyboardNavigation';

const EnhancedInputForm = memo(({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  placeholder, 
  submitText = 'שמור',
  cancelText = 'ביטול',
  type = 'text',
  options = null,
  validation = null,
  helperText = null,
  required = false,
  maxLength = null,
  minLength = null
}) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  
  const focusTrapRef = useFocusTrap(isOpen);
  const { announce } = useAriaLive();

  const validateInput = useCallback((inputValue) => {
    if (required && !inputValue.trim()) {
      return 'שדה זה הוא חובה';
    }

    if (minLength && inputValue.length < minLength) {
      return `חייב להכיל לפחות ${minLength} תווים`;
    }

    if (maxLength && inputValue.length > maxLength) {
      return `לא יכול להכיל יותר מ-${maxLength} תווים`;
    }

    if (validation) {
      try {
        validation(inputValue);
      } catch (err) {
        return err.message;
      }
    }

    return '';
  }, [required, minLength, maxLength, validation]);

  const handleSubmit = useCallback(async () => {
    setTouched(true);
    const validationError = validateInput(value);
    
    if (validationError) {
      setError(validationError);
      announce(validationError, 'assertive');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      let processedValue = value.trim();
      
      if (validation) {
        processedValue = validation(processedValue);
      }
      
      await onSubmit(processedValue);
      setValue('');
      setTouched(false);
      onClose();
      announce('הפעולה בוצעה בהצלחה', 'polite');
    } catch (err) {
      const errorMsg = err.message || 'אירעה שגיאה בלתי צפויה';
      setError(errorMsg);
      announce(errorMsg, 'assertive');
    } finally {
      setIsLoading(false);
    }
  }, [value, validateInput, validation, onSubmit, onClose, announce]);

  const handleCancel = useCallback(() => {
    if (isLoading) return;
    setValue('');
    setError('');
    setTouched(false);
    onClose();
  }, [isLoading, onClose]);

  const handleValueChange = useCallback((e) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    if (touched) {
      const validationError = validateInput(newValue);
      setError(validationError);
    }
  }, [touched, validateInput]);

  const handleBlur = useCallback(() => {
    setTouched(true);
    const validationError = validateInput(value);
    setError(validationError);
  }, [value, validateInput]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !isLoading && type !== 'textarea') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape' && !isLoading) {
      handleCancel();
    }
  }, [handleSubmit, handleCancel, isLoading, type]);

  const getCharacterCount = () => {
    if (!maxLength) return null;
    
    const remaining = maxLength - value.length;
    const isNearLimit = remaining <= Math.max(10, maxLength * 0.1);
    
    return (
      <div 
        style={{ 
          fontSize: theme.typography.fontSizes.xs,
          color: isNearLimit ? theme.colors.warning.main : theme.colors.text.secondary,
          textAlign: 'left',
          marginTop: theme.spacing.xs
        }}
        aria-live="polite"
      >
        {remaining} תווים נותרו
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title={title}>
      <div ref={focusTrapRef}>
        <div style={{ marginBottom: theme.spacing.lg }}>
          {options ? (
            <div>
              <select
                value={value}
                onChange={handleValueChange}
                onKeyDown={handleKeyPress}
                onBlur={handleBlur}
                style={{
                  width: '100%',
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  border: error 
                    ? `2px solid ${theme.colors.error.main}` 
                    : `1px solid ${theme.colors.grey[300]}`,
                  fontSize: theme.typography.fontSizes.md,
                  fontFamily: theme.typography.fontFamily,
                  direction: 'rtl',
                  backgroundColor: theme.colors.background.paper,
                  color: theme.colors.text.primary,
                  outline: 'none',
                  transition: `border-color ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut}`,
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
                disabled={isLoading}
                autoFocus
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'form-error' : helperText ? 'form-helper' : undefined}
                required={required}
              >
                <option value="">{placeholder}</option>
                {options.map((option, index) => (
                  <option key={index} value={option.value || option}>
                    {option.label || option}
                  </option>
                ))}
              </select>
              
              {helperText && !error && (
                <div 
                  id="form-helper"
                  style={{ 
                    color: theme.colors.text.secondary, 
                    fontSize: theme.typography.fontSizes.xs, 
                    marginTop: theme.spacing.xs 
                  }}
                >
                  {helperText}
                </div>
              )}
              
              {error && (
                <div 
                  id="form-error"
                  style={{ 
                    color: theme.colors.error.main, 
                    fontSize: theme.typography.fontSizes.xs, 
                    marginTop: theme.spacing.xs,
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.xs
                  }}
                  role="alert"
                  aria-live="assertive"
                >
                  <span aria-hidden="true">⚠️</span>
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div>
              <AccessibleInput
                type={type === 'textarea' ? 'textarea' : type}
                value={value}
                onChange={handleValueChange}
                onKeyDown={handleKeyPress}
                onBlur={handleBlur}
                placeholder={placeholder}
                error={touched ? error : ''}
                helperText={helperText}
                required={required}
                disabled={isLoading}
                fullWidth
                autoFocus
                maxLength={maxLength}
                minLength={minLength}
                style={type === 'textarea' ? { minHeight: 80, resize: 'vertical' } : {}}
              />
              {getCharacterCount()}
            </div>
          )}
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: theme.spacing.sm, 
          justifyContent: 'flex-end',
          flexDirection: 'row-reverse' // RTL button order
        }}>
          <AccessibleButton
            variant="primary"
            onClick={handleSubmit}
            loading={isLoading}
            disabled={(!value.trim() && required) || isLoading}
            ariaLabel={isLoading ? 'שומר...' : submitText}
          >
            {submitText}
          </AccessibleButton>
          
          <AccessibleButton
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            ariaLabel={cancelText}
          >
            {cancelText}
          </AccessibleButton>
        </div>
      </div>
    </Modal>
  );
});

EnhancedInputForm.displayName = 'EnhancedInputForm';

export default EnhancedInputForm;