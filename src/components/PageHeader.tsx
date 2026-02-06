'use client';

import { Download } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    onExport?: () => void;
    isExporting?: boolean;
    showExport?: boolean;
}

export default function PageHeader({
    title,
    onExport,
    isExporting = false,
    showExport = false
}: PageHeaderProps) {
    return (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Page Title */}
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>

                {/* Export Button */}
                {showExport && onExport && (
                    <button
                        onClick={onExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        {isExporting ? 'Exporting...' : 'Export'}
                    </button>
                )}
            </div>
        </div>
    );
}
