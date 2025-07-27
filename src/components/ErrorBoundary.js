import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    // Clear error state and reload the component
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // Optionally reload the entire page
    if (this.props.reloadOnError) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <div style={{
          direction: 'rtl',
          fontFamily: 'Arial',
          padding: 20,
          textAlign: 'center',
          backgroundColor: '#f5f5f5',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 8,
            border: '1px solid #e0e0e0',
            maxWidth: 400,
            width: '100%'
          }}>
            <h2 style={{ color: '#f44336', marginBottom: 16 }}>
              אופס! משהו השתבש
            </h2>
            <p style={{ color: '#666', marginBottom: 16 }}>
              אירעה שגיאה בלתי צפויה. אנו מתנצלים על אי הנוחות.
            </p>
            
            {this.props.showDetails && this.state.error && (
              <details style={{ marginBottom: 16, textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', color: '#1976d2' }}>
                  פרטי השגיאה (למפתחים)
                </summary>
                <div style={{
                  backgroundColor: '#f5f5f5',
                  padding: 10,
                  borderRadius: 4,
                  marginTop: 8,
                  fontSize: 12,
                  fontFamily: 'monospace',
                  overflow: 'auto',
                  maxHeight: 200
                }}>
                  <div><strong>Error:</strong> {this.state.error.toString()}</div>
                  <div><strong>Component Stack:</strong></div>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </div>
              </details>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button
                onClick={this.handleReload}
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
                נסה שוב
              </button>
              
              {this.props.reloadOnError && (
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 4,
                    border: '1px solid #ddd',
                    background: 'white',
                    color: '#333',
                    cursor: 'pointer'
                  }}
                >
                  רענן דף
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;