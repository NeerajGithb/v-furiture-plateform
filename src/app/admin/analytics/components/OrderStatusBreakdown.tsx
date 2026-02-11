import { SalesAnalytics } from '@/types/admin/analytics';

interface OrderStatusBreakdownProps {
  salesAnalytics: SalesAnalytics;
}

export default function OrderStatusBreakdown({ salesAnalytics }: OrderStatusBreakdownProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {salesAnalytics.ordersByStatus.map((item) => (
          <div key={item.status} className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors bg-white">
            <div className="text-xl font-bold text-gray-900">{item.count.toLocaleString('en-IN')}</div>
            <div className="text-xs font-medium text-gray-500 mt-1 capitalize">{item.status}</div>
            <div className="text-xs text-gray-400 mt-1">{item.percentage}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
