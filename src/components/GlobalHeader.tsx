'use client';

import { usePathname } from 'next/navigation';
import { TimePeriod, useGlobalFilterStore } from '@/stores/globalFilterStore';
import { useMemo } from 'react';
import { X } from 'lucide-react';

const timePeriods: { value: TimePeriod; label: string }[] = [
  { value: '1h', label: '1h' },
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
  { value: '1y', label: '1y' },
  { value: 'all', label: 'All' },
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

  const hasActiveFilters = period !== '30d';

  if (isDetailPage) return null;

  return (
    <header
      role="banner"
      className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10 h-12 flex items-center"
    >
      <div className="px-6 flex items-center gap-4 w-full">
        {/* Label */}
        <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest select-none">
          Period
        </span>

        {/* Pill group */}
        <div
          role="group"
          aria-label="Time period filter"
          className="flex items-center border border-[#E5E7EB] rounded-md overflow-hidden bg-white"
        >
          {timePeriods.map((p, i) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              aria-pressed={period === p.value}
              className={`
                px-3 py-1 text-[12px] font-medium transition-colors duration-100 border-r border-[#E5E7EB] last:border-r-0
                ${period === p.value
                  ? 'bg-[#111111] text-white'
                  : 'bg-white text-[#555555] hover:bg-[#F8F9FA] hover:text-[#111111]'
                }
              `}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Clear filter */}
        {hasActiveFilters && (
          <button
            onClick={reset}
            aria-label="Reset period filter"
            className="flex items-center gap-1.5 text-[12px] text-[#555555] hover:text-[#111111] transition-colors font-medium"
          >
            <X className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>
    </header>
  );
}
