import { IndianRupee, ShoppingCart, Package, BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { SellerDashboardData } from '@/types/seller/dashboard';

interface PrimaryStatsProps {
  data: SellerDashboardData;
}

interface StatCardProps {
  label: string;
  value: string | number;
  subValue: string | number;
  subLabel: string;
  icon: React.ElementType;
  growth?: number;
}

function StatCard({ label, value, subValue, subLabel, icon: Icon, growth = 0 }: StatCardProps) {
  const GrowthIcon = growth > 0 ? TrendingUp : growth < 0 ? TrendingDown : Minus;
  const growthText =
    growth > 0 ? `+${growth.toFixed(1)}%` : growth < 0 ? `${growth.toFixed(1)}%` : '0%';
  const growthColor =
    growth > 0 ? 'text-emerald-600' : growth < 0 ? 'text-rose-500' : 'text-[#9CA3AF]';

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-5 hover:border-[#D1D5DB] hover:shadow-sm transition-all duration-150">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">
          {label}
        </span>
        <div className="w-7 h-7 bg-[#F8F9FA] border border-[#F3F4F6] rounded-md flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-[#6B7280]" />
        </div>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-[26px] font-bold text-[#111111] tabular-nums leading-none">
          {value}
        </span>
        {growth !== 0 && (
          <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${growthColor}`}>
            <GrowthIcon className="w-3 h-3" />
            {growthText}
          </span>
        )}
      </div>

      {/* Sub value */}
      <p className="text-[12px] text-[#9CA3AF]">
        <span className="font-semibold text-[#555555]">{subValue}</span>{' '}
        {subLabel}
      </p>
    </div>
  );
}

export function PrimaryStats({ data }: PrimaryStatsProps) {
  const stats: StatCardProps[] = [
    {
      label: 'Total Revenue',
      value: formatCurrency(data.revenue?.total || 0),
      subValue: formatCurrency(data.revenue?.completed || 0),
      subLabel: 'Completed',
      icon: IndianRupee,
      growth: data.revenue?.growth || 0,
    },
    {
      label: 'Total Orders',
      value: data.orders?.total || 0,
      subValue: data.orders?.delivered || 0,
      subLabel: 'Delivered',
      icon: ShoppingCart,
    },
    {
      label: 'Products',
      value: data.products?.total || 0,
      subValue: data.products?.published || 0,
      subLabel: 'Published',
      icon: Package,
    },
    {
      label: 'Fulfillment Rate',
      value: `${(((data.orders?.delivered || 0) / Math.max(data.orders?.total || 1, 1)) * 100).toFixed(1)}%`,
      subValue: data.products?.published || 0,
      subLabel: 'Active',
      icon: BarChart3,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
