'use client';

import { Download } from 'lucide-react';
import { EarningsHeaderProps } from '@/types/seller/earnings';

export default function EarningsHeader({
  period,
  onPeriodChange,
  onExport,
  isExporting
}: EarningsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
        <p className="text-sm text-gray-500 mt-1">Track your revenue and payouts</p>
      </div>
      <div className="flex items-center gap-3">
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm bg-white"
        >
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="90days">Last 90 days</option>
          <option value="1year">Last year</option>
        </select>
        <button
          onClick={onExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exporting...' : 'Export'}
        </button>
      </div>
    </div>
  );
}