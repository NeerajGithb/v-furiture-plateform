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
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex items-center justify-center w-full h-full min-h-[220px] ${className}`}>
      <div className="text-center">
        {Icon && (
          <div className="w-10 h-10 bg-[#F3F4F6] rounded-lg flex items-center justify-center mx-auto mb-3">
            <Icon className="w-5 h-5 text-[#9CA3AF]" />
          </div>
        )}
        <p className="text-[13px] font-semibold text-[#374151]">{title}</p>
        {message && (
          <p className="text-[12px] text-[#9CA3AF] mt-1 max-w-xs mx-auto leading-relaxed">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
