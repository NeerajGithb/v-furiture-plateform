'use client';

import { Package, AlertTriangle, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { InventoryStatsProps } from '@/types/seller/inventory';

const items = (stats: InventoryStatsProps['stats']) => [
  { label: 'Total Items', value: stats?.total || 0, icon: Package, dot: 'bg-[#6B7280]' },
  { label: 'In Stock', value: stats?.inStock || 0, icon: TrendingUp, dot: 'bg-emerald-400' },
  { label: 'Low Stock', value: stats?.lowStock || 0, icon: TrendingDown, dot: 'bg-amber-400' },
  { label: 'Out of Stock', value: stats?.outOfStock || 0, icon: AlertTriangle, dot: 'bg-rose-400' },
  { label: 'Total Value', value: formatCurrency(stats?.totalValue || 0), icon: BarChart3, dot: 'bg-blue-400' },
];

export default function InventoryStats({ stats }: InventoryStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {items(stats).map(({ label, value, icon: Icon, dot }) => (
        <div
          key={label}
          className="bg-white border border-[#E5E7EB] rounded-lg p-5 hover:border-[#D1D5DB] hover:shadow-sm transition-all duration-150"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">{label}</span>
            <div className="w-7 h-7 bg-[#F8F9FA] border border-[#F3F4F6] rounded-md flex items-center justify-center">
              <Icon className="w-3.5 h-3.5 text-[#6B7280]" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
            <span className="text-[22px] font-bold text-[#111111] tabular-nums leading-none truncate">{value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}