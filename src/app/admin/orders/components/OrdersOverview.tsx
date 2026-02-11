import {
  ShoppingCart, Clock, Package, Truck, CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';
import { OrdersOverviewProps } from '@/types/admin/orders';

export default function OrdersOverview({ stats, onTabChange, activeTab }: OrdersOverviewProps) {
  const statItems = [
    { label: 'Total Orders', value: stats.total, icon: ShoppingCart, tab: 'all' },
    { label: 'Pending', value: stats.pending, icon: Clock, tab: 'pending' },
    { label: 'Processing', value: stats.processing, icon: Package, tab: 'processing' },
    { label: 'Shipped', value: stats.shipped, icon: Truck, tab: 'shipped' },
    { label: 'Delivered', value: stats.delivered, icon: CheckCircle, tab: 'delivered' },
    { label: 'Cancelled', value: stats.cancelled, icon: XCircle, tab: 'cancelled' },
    { label: 'Returned', value: stats.returned, icon: AlertTriangle, tab: 'returned' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {statItems.map((item) => {
        const isActive = activeTab === item.tab;
        const Icon = item.icon;

        return (
          <button
            key={item.tab}
            onClick={() => onTabChange(item.tab)}
            className={`flex flex-col p-4 rounded-lg border transition-all text-left ${isActive
                ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                : 'bg-white text-gray-900 border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                {item.label}
              </span>
              <Icon className={`w-4 h-4 ${isActive ? 'text-gray-300' : 'text-gray-400'}`} />
            </div>
            <span className="text-2xl font-bold">
              {item.value.toLocaleString()}
            </span>
          </button>
        );
      })}
    </div>
  );
}
