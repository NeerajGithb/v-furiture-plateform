import { Package, Eye, FileEdit, AlertTriangle } from 'lucide-react';
import { ProductStats } from '@/types/seller/products';

interface ProductsStatsProps {
  stats: ProductStats;
}

const statItems = (stats: ProductStats) => [
  { label: 'Total Products', value: stats.total, icon: Package, dot: 'bg-[#6B7280]' },
  { label: 'Published', value: stats.published, icon: Eye, dot: 'bg-emerald-400' },
  { label: 'Draft', value: stats.draft, icon: FileEdit, dot: 'bg-amber-400' },
  { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, dot: 'bg-rose-400' },
];

export function ProductsStats({ stats }: ProductsStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
      {statItems(stats).map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-[#E5E7EB] rounded-lg p-5 hover:border-[#D1D5DB] hover:shadow-sm transition-all duration-150"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">
              {stat.label}
            </span>
            <div className="w-7 h-7 bg-[#F8F9FA] border border-[#F3F4F6] rounded-md flex items-center justify-center">
              <stat.icon className="w-3.5 h-3.5 text-[#6B7280]" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${stat.dot}`} />
            <span className="text-[24px] font-bold text-[#111111] tabular-nums leading-none">
              {stat.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
