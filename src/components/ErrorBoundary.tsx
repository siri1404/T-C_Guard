import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorReporting } from '../services/ErrorReporting';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  private errorReporting: ErrorReporting;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
    this.errorReporting = ErrorReporting.getInstance();
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Report error
    this.errorReporting.reportError(error, {
      action: 'component_error',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });

    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
          <div className="bg-white/5 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-4">Something went wrong</h2>
            
            <p className="text-slate-400 mb-6 leading-relaxed">
              T&C Guard encountered an unexpected error. This has been reported automatically.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-slate-400 cursor-pointer mb-2">Error Details</summary>
                <pre className="bg-black/20 p-4 rounded-lg text-xs text-red-400 overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-colors"
              >
                Reload Extension
              </button>
            </div>

            <p className="text-slate-500 text-sm mt-6">
              If this problem persists, please contact support with the error details.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}