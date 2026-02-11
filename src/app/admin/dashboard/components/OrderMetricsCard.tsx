import type { OrderMetrics } from '@/types/admin/dashboard';
import MetricItem from './MetricItem';

interface OrderMetricsCardProps {
  orders: OrderMetrics;
}

export default function OrderMetricsCard({ orders }: OrderMetricsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Order Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <MetricItem label="Total Orders" value={orders.totalOrders.toLocaleString('en-IN')} />
        <MetricItem label="Pending" value={orders.pendingOrders.toLocaleString('en-IN')} />
        <MetricItem label="Processing" value={orders.processingOrders.toLocaleString('en-IN')} />
        <MetricItem label="Shipped" value={orders.shippedOrders.toLocaleString('en-IN')} />
        <MetricItem label="Delivered" value={orders.deliveredOrders.toLocaleString('en-IN')} />
        <MetricItem label="Cancelled" value={orders.cancelledOrders.toLocaleString('en-IN')} />
        <MetricItem label="Returned" value={orders.returnedOrders.toLocaleString('en-IN')} />
      </div>
    </div>
  );
}
