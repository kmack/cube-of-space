// src/components/scene-error-boundary.tsx
import * as React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error boundary for the 3D scene to prevent full app crashes
 * Catches errors from Three.js rendering, texture loading, and component lifecycle
 */
export class SceneErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error details for debugging
    console.error('Scene Error Boundary caught an error:', error);
    console.error('Error Info:', errorInfo);

    // Store error info in state for display
    this.setState({
      errorInfo,
    });

    // In production, you might want to send this to an error reporting service
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = (): void => {
    // Reset error state to attempt recovery
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            color: '#ffffff',
            padding: '2rem',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              maxWidth: '600px',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '2rem',
              backdropFilter: 'blur(10px)',
            }}
          >
            <h1
              style={{
                fontSize: '2rem',
                marginBottom: '1rem',
                color: '#ff6b6b',
              }}
            >
              ⚠️ Scene Error
            </h1>
            <p
              style={{
                fontSize: '1.1rem',
                marginBottom: '1.5rem',
                opacity: 0.9,
              }}
            >
              The 3D scene encountered an error and could not render properly.
            </p>
            {this.state.error && (
              <details
                style={{
                  marginBottom: '1.5rem',
                  textAlign: 'left',
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                }}
              >
                <summary
                  style={{
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                  }}
                >
                  Error Details
                </summary>
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Error:</strong> {this.state.error.message}
                </div>
                {this.state.errorInfo && (
                  <pre
                    style={{
                      marginTop: '0.5rem',
                      fontSize: '0.8rem',
                      overflow: 'auto',
                      maxHeight: '200px',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
            <div
              style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}
            >
              <button
                onClick={this.handleReset}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
