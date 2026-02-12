import { IndianRupee, ShoppingCart, Package, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { SellerDashboardData } from '@/types/seller/dashboard';

interface PrimaryStatsProps {
  data: SellerDashboardData;
}

export function PrimaryStats({ data }: PrimaryStatsProps) {
  const getGrowthColor = (value: number) => {
    if (value > 0) return 'text-emerald-700 bg-emerald-50';
    if (value < 0) return 'text-rose-700 bg-rose-50';
    return 'text-slate-600 bg-slate-50';
  };

  const stats = [
    {
      label: 'Total Revenue',
      value: formatCurrency(data.revenue?.total || 0),
      subValue: formatCurrency(data.revenue?.completed || 0),
      subLabel: 'Completed',
      icon: IndianRupee,
      growth: data.revenue?.growth || 0
    },
    {
      label: 'Total Orders',
      value: data.orders?.total || 0,
      subValue: data.orders?.delivered || 0,
      subLabel: 'Delivered',
      icon: ShoppingCart,
      growth: 0
    },
    {
      label: 'Products',
      value: data.products?.total || 0,
      subValue: data.products?.published || 0,
      subLabel: 'Published',
      icon: Package,
      growth: 0
    },
    {
      label: 'Fulfillment Rate',
      value: `${((data.orders?.delivered || 0) / Math.max(data.orders?.total || 1, 1) * 100).toFixed(1)}%`,
      subValue: data.products?.published || 0,
      subLabel: 'Active',
      icon: BarChart3,
      growth: 0
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-slate-200 rounded-lg p-6 hover:border-slate-300 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{stat.label}</h3>
            <stat.icon className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
              {stat.growth !== 0 && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${getGrowthColor(stat.growth)}`}>
                  {stat.growth > 0 ? '+' : ''}{stat.growth.toFixed(1)}%
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{stat.subValue}</span> {stat.subLabel}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
