import React from 'react';
import { Loader } from './Loader';
import { AlertCircle, RefreshCw } from 'lucide-react';

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
  children,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[calc(100vh-200px)]">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 bg-[#FEF2F2] border border-[#FECACA] rounded-lg flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-5 h-5 text-[#DC2626]" />
          </div>
          <p className="text-[14px] font-semibold text-[#111111] mb-1">Failed to Load Data</p>
          <p className="text-[12px] text-[#9CA3AF] max-w-xs mx-auto mb-4">
            {error.message || 'Unable to load data. Please try again.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="
              inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium
              text-[#555555] bg-white border border-[#E5E7EB] rounded-md
              hover:bg-[#F8F9FA] hover:text-[#111111] transition-all
            "
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload
          </button>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[13px] text-[#9CA3AF] font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {typeof children === 'function' ? children() : children}
    </div>
  );
};