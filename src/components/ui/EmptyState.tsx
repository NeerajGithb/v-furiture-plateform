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
    <div className={`flex items-center justify-center w-full h-full min-h-[220px] ${className}`}>
      <div className="text-center">
        {Icon && <Icon className="w-12 h-12 text-slate-300 mx-auto mb-4" />}
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        {message && <p className="text-sm text-slate-500 mt-2">{message}</p>}
      </div>
    </div>
  );
}
