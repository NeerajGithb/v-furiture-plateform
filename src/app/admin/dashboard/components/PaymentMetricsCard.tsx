import type { PaymentMetrics } from '@/types/admin/dashboard';
import MetricItem from './MetricItem';

interface PaymentMetricsCardProps {
  payments: PaymentMetrics;
}

export default function PaymentMetricsCard({ payments }: PaymentMetricsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Payment Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <MetricItem label="Total Payments" value={payments.totalPayments.toLocaleString('en-IN')} />
        <MetricItem label="Paid" value={payments.paidOrders.toLocaleString('en-IN')} />
        <MetricItem label="Pending" value={payments.pendingPayments.toLocaleString('en-IN')} />
        <MetricItem label="Failed" value={payments.failedPayments.toLocaleString('en-IN')} />
        <MetricItem label="Refunded" value={payments.refundedPayments.toLocaleString('en-IN')} />
      </div>
    </div>
  );
}
