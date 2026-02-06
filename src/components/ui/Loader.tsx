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
    ? 'fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50'
    : 'flex items-center justify-center w-full h-full min-h-[200px]';

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-6 w-6 border-2';
      case 'lg':
        return 'h-16 w-16 border-4';
      default:
        return 'h-12 w-12 border-2';
    }
  };

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-blue-600 border-gray-200 mx-auto ${getSizeClasses()}`}></div>
        {text && <p className="mt-4 text-gray-600">{text}</p>}
      </div>
    </div>
  );
};