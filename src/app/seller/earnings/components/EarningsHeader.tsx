'use client';

import { Download } from 'lucide-react';
import { EarningsHeaderProps } from '@/types/seller/earnings';

const PERIOD_OPTIONS = [
  { value: '7days', label: 'Last 7 days' },
  { value: '30days', label: 'Last 30 days' },
  { value: '90days', label: 'Last 90 days' },
  { value: '1year', label: 'Last year' },
];

export default function EarningsHeader({ period, onPeriodChange, onExport, isExporting }: EarningsHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-[20px] font-semibold text-[#111111] tracking-tight leading-tight">Earnings</h1>
        <p className="text-[13px] text-[#6B7280] mt-0.5">Track your revenue and payouts</p>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={period}
          onChange={e => onPeriodChange(e.target.value)}
          className="px-3 py-1.5 text-[12px] font-medium text-[#374151] border border-[#E5E7EB] rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#111111] focus:border-transparent cursor-pointer"
        >
          {PERIOD_OPTIONS.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        <button
          onClick={onExport}
          disabled={isExporting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#555555] bg-white border border-[#E5E7EB] rounded-md hover:bg-[#F8F9FA] hover:text-[#111111] disabled:opacity-40 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          {isExporting ? 'Exporting…' : 'Export'}
        </button>
      </div>
    </div>
  );
}