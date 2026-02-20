'use client';

import { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
    onRefresh?: () => void;
    isRefreshing?: boolean;
}

export default function PageHeader({
    title,
    description,
    actions,
    onRefresh,
    isRefreshing = false,
}: PageHeaderProps) {
    return (
        <div className="flex items-start justify-between mb-6">
            {/* Title block */}
            <div>
                <h1 className="text-[20px] font-semibold text-[#111111] tracking-tight leading-tight">
                    {title}
                </h1>
                {description && (
                    <p className="text-[13px] text-[#6B7280] mt-0.5 font-normal">{description}</p>
                )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        aria-label="Refresh data"
                        className="
              inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium
              text-[#555555] bg-white border border-[#E5E7EB] rounded-md
              hover:bg-[#F8F9FA] hover:text-[#111111] hover:border-[#D1D5DB]
              transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-[#111111] focus:ring-offset-1
            "
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                )}
                {actions}
            </div>
        </div>
    );
}
