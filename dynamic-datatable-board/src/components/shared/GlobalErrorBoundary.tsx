import React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { AlertTriangle } from 'lucide-react';

/**
 * The fallback UI rendered when the GlobalErrorBoundary catches an error.
 */
function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50/50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-red-50 p-6 border-b border-red-100 flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Oops! Something went wrong.
          </h2>
          <p className="text-sm text-slate-600 max-w-sm">
            We apologize for the inconvenience. An unexpected error occurred while rendering this page.
          </p>
        </div>
        
        <div className="p-6 bg-slate-50">
          <div className="bg-slate-900 rounded-lg p-4 mb-6 overflow-x-auto">
            <code className="text-xs text-red-400 font-mono whitespace-pre-wrap break-all">
              {error instanceof Error ? error.message : String(error) || 'Unknown error occurred'}
            </code>
          </div>
          
          <button
            onClick={resetErrorBoundary}
            className="w-full flex items-center justify-center px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors focus:ring-4 focus:ring-slate-200"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Global Error Boundary that catches runtime errors and displays a user-friendly fallback UI.
 */
export function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}
