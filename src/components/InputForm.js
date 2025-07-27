import React, { useState, memo, useCallback } from 'react';
import Modal from './Modal';

const InputForm = memo(({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  placeholder, 
  submitText = 'שמור',
  cancelText = 'ביטול',
  type = 'text',
  options = null, // For dropdown/select
  validation = null // Validation function
}) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = useCallback(() => {
    setError('');
    
    if (!value.trim()) {
      setError('שדה זה הוא חובה');
      return;
    }

    // Run validation if provided
    if (validation) {
      try {
        const validatedValue = validation(value);
        onSubmit(validatedValue);
        setValue('');
        onClose();
      } catch (err) {
        setError(err.message);
      }
    } else {
      onSubmit(value.trim());
      setValue('');
      onClose();
    }
  }, [value, validation, onSubmit, onClose]);

  const handleCancel = useCallback(() => {
    setValue('');
    setError('');
    onClose();
  }, [onClose]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }, [handleSubmit, handleCancel]);

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title={title}>
      <div style={{ marginBottom: 16 }}>
        {options ? (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyPress}
            style={{
              width: '100%',
              padding: 8,
              borderRadius: 4,
              border: error ? '2px solid #f44336' : '1px solid #ddd',
              fontSize: 14,
              direction: 'rtl'
            }}
            autoFocus
          >
            <option value="">{placeholder}</option>
            {options.map((option, index) => (
              <option key={index} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: 8,
              borderRadius: 4,
              border: error ? '2px solid #f44336' : '1px solid #ddd',
              fontSize: 14,
              direction: 'rtl',
              minHeight: 80,
              resize: 'vertical',
              fontFamily: 'Arial'
            }}
            autoFocus
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: 8,
              borderRadius: 4,
              border: error ? '2px solid #f44336' : '1px solid #ddd',
              fontSize: 14,
              direction: 'rtl'
            }}
            autoFocus
          />
        )}
        {error && (
          <div style={{ color: '#f44336', fontSize: 12, marginTop: 4 }}>
            {error}
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          onClick={handleCancel}
          style={{
            padding: '8px 16px',
            borderRadius: 4,
            border: '1px solid #ddd',
            background: 'white',
            color: '#333',
            cursor: 'pointer'
          }}
        >
          {cancelText}
        </button>
        <button
          onClick={handleSubmit}
          style={{
            padding: '8px 16px',
            borderRadius: 4,
            border: 'none',
            background: '#1976d2',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {submitText}
        </button>
      </div>
    </Modal>
  );
});

export default InputForm;