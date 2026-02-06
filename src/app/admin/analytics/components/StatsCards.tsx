import { IndianRupee, ShoppingCart, Package, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { StatsCardsProps } from '@/types';

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

export default function StatsCards({
  revenue,
  orders,
  products,
  users,
  growth,
  selectedMetric = 'revenue',
  onMetricSelect
}: StatsCardsProps) {
  const handleCardClick = (metric: string) => {
    onMetricSelect(metric);
  };

  const getCardClasses = (metric: string) => {
    const isSelected = selectedMetric === metric;
    const clickable = 'cursor-pointer hover:border-gray-400 transition-colors';
    const selected = isSelected ? 'ring-2 ring-gray-900 border-transparent shadow-sm' : 'border-gray-200';
    return `bg-white rounded-lg border p-5 ${clickable} ${selected}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        className={getCardClasses('revenue')}
        onClick={() => handleCardClick('revenue')}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">Revenue</span>
          <div className="p-1.5 bg-gray-50 rounded-md">
            <IndianRupee className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(revenue.paid)}</h3>
          <GrowthBadge value={growth.revenue} />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Completed: {formatCurrency(revenue.completed)}
        </p>
      </div>

      <div
        className={getCardClasses('orders')}
        onClick={() => handleCardClick('orders')}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">Orders</span>
          <div className="p-1.5 bg-gray-50 rounded-md">
            <ShoppingCart className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <h3 className="text-2xl font-bold text-gray-900">{orders.total}</h3>
          <GrowthBadge value={growth.orders} />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          AOV: {formatCurrency(revenue.avgOrderValue)}
        </p>
      </div>

      <div
        className={getCardClasses('products')}
        onClick={() => handleCardClick('products')}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">Products</span>
          <div className="p-1.5 bg-gray-50 rounded-md">
            <Package className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <h3 className="text-2xl font-bold text-gray-900">{products.total}</h3>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Published: {products.published}
        </p>
      </div>

      <div
        className={getCardClasses('users')}
        onClick={() => handleCardClick('users')}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">Users</span>
          <div className="p-1.5 bg-gray-50 rounded-md">
            <Users className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <h3 className="text-2xl font-bold text-gray-900">{users.total}</h3>
          <GrowthBadge value={growth.users} />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Customers: {users.uniqueCustomers}
        </p>
      </div>
    </div>
  );
}
