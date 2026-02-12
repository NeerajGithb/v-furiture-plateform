'use client';

import { usePathname } from 'next/navigation';
import { TimePeriod, useGlobalFilterStore } from '@/stores/globalFilterStore';
import { useMemo } from 'react';

const timePeriods: { value: TimePeriod; label: string }[] = [
  { value: '1h', label: '1 Hour' },
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
  { value: 'all', label: 'All Time' },
];

export default function GlobalHeader() {
  const pathname = usePathname();

  const { period, setPeriod, reset } = useGlobalFilterStore();

  const isDetailPage = useMemo(() => {
    if (!pathname) return false;

    const hideHeaderPatterns = [
      /\/profile$/,
      /\/coupons/,
      /\/products\/new$/,
      /\/products\/[^\/]+\/edit$/,
      /\/orders\/[^\/]+$/,
    ];

    return hideHeaderPatterns.some(pattern => pattern.test(pathname));
  }, [pathname]);

  const handlePeriodChange = (newPeriod: TimePeriod) => {
    setPeriod(newPeriod);
  };

  const handleClearFilters = () => {
    reset();
  };

  const hasActiveFilters = period !== '30d';

  if (isDetailPage) {
    return null;
  }

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Period:</span>
            <div className="flex bg-slate-100 p-1 rounded-lg gap-0.5">
              {timePeriods.map((periodOption) => (
                <button
                  key={periodOption.value}
                  onClick={() => handlePeriodChange(periodOption.value)}
                  className={`px-3.5 py-2 text-sm font-medium rounded-md transition-all ${period === periodOption.value
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  {periodOption.label}
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
