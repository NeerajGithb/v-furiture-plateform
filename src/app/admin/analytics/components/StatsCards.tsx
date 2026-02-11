import { IndianRupee, ShoppingCart, Package, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { AnalyticsOverview } from '@/types/admin/analytics';

const GrowthBadge = ({ value }: { value: number }) => {
  if (value === 0) return null;
  const isPositive = value > 0;
  return (
    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${isPositive ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      <span>{Math.abs(value).toFixed(1)}%</span>
    </div>
  );
};

interface StatsCardsProps {
  overview: AnalyticsOverview;
}

export default function StatsCards({ overview }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">Revenue</span>
          <div className="p-1.5 bg-gray-50 rounded-md">
            <IndianRupee className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(overview.totalRevenue)}</h3>
          <GrowthBadge value={overview.revenueGrowth} />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          AOV: {formatCurrency(overview.avgOrderValue)}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">Orders</span>
          <div className="p-1.5 bg-gray-50 rounded-md">
            <ShoppingCart className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <h3 className="text-2xl font-bold text-gray-900">{overview.totalOrders.toLocaleString('en-IN')}</h3>
          <GrowthBadge value={overview.ordersGrowth} />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Conversion: {overview.conversionRate.toFixed(1)}%
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">Products</span>
          <div className="p-1.5 bg-gray-50 rounded-md">
            <Package className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <h3 className="text-2xl font-bold text-gray-900">{overview.totalProducts.toLocaleString('en-IN')}</h3>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Sellers: {overview.totalSellers.toLocaleString('en-IN')}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">Users</span>
          <div className="p-1.5 bg-gray-50 rounded-md">
            <Users className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <h3 className="text-2xl font-bold text-gray-900">{overview.totalUsers.toLocaleString('en-IN')}</h3>
          <GrowthBadge value={overview.usersGrowth} />
        </div>
      </div>
    </div>
  );
}
