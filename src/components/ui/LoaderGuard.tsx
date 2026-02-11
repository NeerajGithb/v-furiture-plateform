import React from 'react';
import { Loader } from './Loader';

interface LoaderGuardProps {
  isLoading: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: (() => React.ReactNode) | React.ReactNode;
}

export const LoaderGuard: React.FC<LoaderGuardProps> = ({
  isLoading,
  error,
  isEmpty = false,
  emptyMessage = 'No data available',
  children
}) => {
  // Only show loader on initial load, not on refetch
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[calc(100vh-200px)]">
        <Loader />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">
            Error Loading Data
          </div>
          <div className="text-gray-600 text-sm max-w-md">
            {error.message || 'Unable to load data. Please try again.'}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Show empty state only after loading is complete
  if (isEmpty) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-500 text-lg">
            {emptyMessage}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {typeof children === 'function' ? children() : children}
    </div>
  );
};