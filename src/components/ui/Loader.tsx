import React from 'react';

interface LoaderProps {
  text?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Loader: React.FC<LoaderProps> = ({
  text = 'Loading...',
  fullScreen = false,
  size = 'md'
}) => {
  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50'
    : 'flex items-center justify-center w-full h-full min-h-[220px]';

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8 border-2';
      case 'lg':
        return 'h-16 w-16 border-4';
      default:
        return 'h-12 w-12 border-[3px]';
    }
  };

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-slate-900 border-slate-200 mx-auto ${getSizeClasses()}`}></div>
        {text && <p className="mt-4 text-sm text-slate-600">{text}</p>}
      </div>
    </div>
  );
};