import { Clock, CheckCircle, Package, ShoppingBag, ShoppingCart, XCircle, Truck } from 'lucide-react';
import { OrderStatusBreakdownProps } from '@/types';

export default function OrderStatusBreakdown({ orders }: OrderStatusBreakdownProps) {
  const items = [
    { label: 'Pending', value: orders.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Confirmed', value: orders.confirmed, icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Processing', value: orders.processing, icon: Package, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Shipped', value: orders.shipped, icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Delivered', value: orders.delivered, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Cancelled', value: orders.cancelled, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Total', value: orders.total, icon: ShoppingCart, color: 'text-gray-600', bg: 'bg-gray-50' },
  ];

  return (
    <div className="bg-white rounded-lg p-5 border border-gray-200">
      <h2 className="text-base font-bold text-gray-900 mb-4">Order Status Breakdown</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors bg-white">
            <div className={`p-2 rounded-full mb-2 ${item.bg}`}>
              <item.icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <div className="text-xl font-bold text-gray-900">{item.value.toLocaleString()}</div>
            <div className="text-xs font-medium text-gray-500 mt-1">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
