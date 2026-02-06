import { IndianRupee, ShoppingCart, Users, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { MainStatsCardsProps } from '@/types';

export default function MainStatsCards({ revenue, orders, users, products, growth }: MainStatsCardsProps) {
  const statCards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(revenue.total, true),
      icon: IndianRupee,
      subtext: `AOV: ${formatCurrency(revenue.avgOrderValue, true)}`,
      growth: growth.revenue
    },
    {
      label: 'Total Orders',
      value: orders.total,
      icon: ShoppingCart,
      subtext: `${orders.pending + orders.processing} active`,
      growth: growth.orders
    },
    {
      label: 'Total Users',
      value: users.total,
      icon: Users,
      subtext: `${users.verified} verified`,
      growth: growth.users
    },
    {
      label: 'Products',
      value: products.total,
      icon: Package,
      subtext: `${products.published} active`,
      growth: null
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">{card.label}</h3>
            <div className="p-2 bg-gray-50 rounded-lg">
              <card.icon className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <h2 className="text-2xl font-bold text-gray-900">{card.value}</h2>

            {card.growth !== null && (
              <div className={`flex items-center text-xs font-medium px-1.5 py-0.5 rounded ${card.growth >= 0
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-rose-700 bg-rose-50'
                }`}>
                {card.growth >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                <span>{Math.abs(card.growth).toFixed(1)}%</span>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-1">{card.subtext}</p>
        </div>
      ))}
    </div>
  );
}
