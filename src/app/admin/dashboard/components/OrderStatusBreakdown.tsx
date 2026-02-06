import { OrderStats } from '@/types/admin';

interface Props {
  orders: OrderStats;
}

export default function OrderStatusBreakdown({ orders }: Props) {
  const statuses = [
    { label: 'Pending', value: orders.pending, color: 'text-amber-600', dot: 'bg-amber-500' },
    { label: 'Processing', value: orders.processing, color: 'text-blue-600', dot: 'bg-blue-500' },
    { label: 'Shipped', value: orders.shipped, color: 'text-violet-600', dot: 'bg-violet-500' },
    { label: 'Delivered', value: orders.delivered, color: 'text-emerald-600', dot: 'bg-emerald-500' },
    { label: 'Cancelled', value: orders.cancelled, color: 'text-red-600', dot: 'bg-red-500' },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Order Status Breakdown</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statuses.map((status) => (
          <div key={status.label} className="flex flex-col items-center p-3 rounded-lg bg-gray-50 border border-gray-100">
            <div className={`w-2 h-2 rounded-full mb-2 ${status.dot}`} />
            <span className="text-2xl font-bold text-gray-900">{status.value}</span>
            <span className="text-xs font-medium text-gray-500 mt-1">{status.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
