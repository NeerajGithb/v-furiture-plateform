import React from 'react';

interface LoaderProps {
  text?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Loader: React.FC<LoaderProps> = ({
  text = 'Loading...',
  fullScreen = false,
  size = 'md',
}) => {
  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-white/95 flex items-center justify-center z-50'
    : 'flex items-center justify-center w-full h-full min-h-[220px]';

  const sizeClasses = {
    sm: 'h-5 w-5 border-[1.5px]',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-[3px]',
  }[size];

  return (
    <div className={containerClasses} aria-label="Loading" role="status">
      <div className="flex flex-col items-center gap-3">
        <div
          className={`animate-spin rounded-full border-[#E5E7EB] border-t-[#111111] ${sizeClasses}`}
        />
        {text && (
          <p className="text-[12px] font-medium text-[#9CA3AF]">{text}</p>
        )}
      </div>
    </div>
  );
};