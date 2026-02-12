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
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <h3 className="text-sm font-semibold text-slate-900 mb-5 uppercase tracking-wide">
        Order Status
      </h3>
      <div className="space-y-4">
        {statusStats.map((status) => (
          <div key={status.label} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${status.color.split(' ')[1]}`}>
                <status.icon className={`w-5 h-5 ${status.color.split(' ')[0]}`} />
              </div>
              <span className="text-base font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                {status.label}
              </span>
            </div>
            <span className="text-base font-bold text-slate-900 tabular-nums">
              {status.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100">
        <div className="flex items-center justify-between text-sm mb-4">
          <span className="text-slate-600">Avg. Order Value</span>
          <span className="font-semibold text-slate-900 text-base">
            {formatCurrency((revenue.total || 0) / Math.max(orders.total || 1, 1))}
          </span>
        </div>
        <button
          onClick={() => window.location.href = '/seller/orders'}
          className="w-full text-sm font-semibold text-slate-700 hover:text-slate-900 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          View All Orders
        </button>
      </div>
    </div>
  );
}
