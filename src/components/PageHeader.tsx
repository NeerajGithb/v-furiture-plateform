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
    isRefreshing = false
}: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {description && (
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                )}
            </div>
            <div className="flex items-center gap-3">
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium text-gray-700"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                )}
                {actions}
            </div>
        </div>
    );
}
