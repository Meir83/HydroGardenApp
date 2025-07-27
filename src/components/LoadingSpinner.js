import React from 'react';

const LoadingSpinner = ({ size = 'md', color = '#4CAF50' }) => {
  const sizes = {
    sm: '16px',
    md: '24px',
    lg: '32px',
    xl: '48px'
  };

  const spinnerStyle = {
    width: sizes[size],
    height: sizes[size],
    border: `2px solid rgba(76, 175, 80, 0.1)`,
    borderTop: `2px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={spinnerStyle}></div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;