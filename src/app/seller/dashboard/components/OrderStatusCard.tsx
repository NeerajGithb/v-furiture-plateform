import { Clock, Package, Truck, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { SellerOrderStats, SellerRevenueStats } from '@/types/seller/dashboard';

interface OrderStatusCardProps {
  orders: SellerOrderStats;
  revenue: SellerRevenueStats;
}

export function OrderStatusCard({ orders, revenue }: OrderStatusCardProps) {
  const statusStats = [
    { label: 'Pending', value: orders.pending, color: 'text-amber-700 bg-amber-50', icon: Clock },
    { label: 'Processing', value: orders.processing, color: 'text-blue-700 bg-blue-50', icon: Package },
    { label: 'Shipped', value: orders.shipped, color: 'text-purple-700 bg-purple-50', icon: Truck },
    { label: 'Delivered', value: orders.delivered, color: 'text-emerald-700 bg-emerald-50', icon: CheckCircle }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
        Order Status
      </h3>
      <div className="space-y-4">
        {statusStats.map((status) => (
          <div key={status.label} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-md ${status.color.split(' ')[1]}`}>
                <status.icon className={`w-4 h-4 ${status.color.split(' ')[0]}`} />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                {status.label}
              </span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {status.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-gray-500">Avg. Order Value</span>
          <span className="font-medium text-gray-900">
            {formatCurrency((revenue.total || 0) / Math.max(orders.total || 1, 1))}
          </span>
        </div>
        <button 
          onClick={() => window.location.href = '/seller/orders'} 
          className="w-full mt-2 text-sm text-center text-gray-600 hover:text-gray-900 font-medium py-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
        >
          View All Orders
        </button>
      </div>
    </div>
  );
}
