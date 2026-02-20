import type { OrderMetrics } from '@/types/admin/dashboard';
import MetricItem from './MetricItem';

interface OrderMetricsCardProps {
  orders: OrderMetrics;
}

export default function OrderMetricsCard({ orders }: OrderMetricsCardProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
      <h2 className="text-[15px] font-semibold text-[#111111] mb-5 tracking-tight">Order Metrics</h2>
      <div className="flex flex-wrap gap-6">
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
