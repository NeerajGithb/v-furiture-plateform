import React from 'react';
import { Loader } from './Loader';

interface LoaderGuardProps {
  isLoading: boolean;
  error?: Error | null;
  children: React.ReactNode;
}

export const LoaderGuard: React.FC<LoaderGuardProps> = ({
  isLoading,
  error,
  children
}) => {
  if (isLoading) {
    return <Loader fullScreen />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">
            Something went wrong
          </div>
          <div className="text-gray-600 text-sm">
            {error.message || 'An unexpected error occurred'}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {children}
    </div>
  );
};