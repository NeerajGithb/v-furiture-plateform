import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  message?: string;
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title = 'No data available',
  message,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`flex items-center justify-center w-full h-full min-h-[200px] ${className}`}>
      <div className="text-center">
        {Icon && <Icon className="w-12 h-12 text-gray-300 mx-auto mb-4" />}
        <p className="text-gray-900 font-medium">{title}</p>
        {message && <p className="text-gray-500 text-sm mt-1">{message}</p>}
      </div>
    </div>
  );
}
