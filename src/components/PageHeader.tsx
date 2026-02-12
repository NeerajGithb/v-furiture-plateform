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
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
                {description && (
                    <p className="text-sm text-slate-600 mt-1">{description}</p>
                )}
            </div>
            <div className="flex items-center gap-3">
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 text-sm font-medium text-slate-700"
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
