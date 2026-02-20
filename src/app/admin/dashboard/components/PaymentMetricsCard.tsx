import type { PaymentMetrics } from '@/types/admin/dashboard';
import MetricItem from './MetricItem';

interface PaymentMetricsCardProps {
  payments: PaymentMetrics;
}

export default function PaymentMetricsCard({ payments }: PaymentMetricsCardProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
      <h2 className="text-[15px] font-semibold text-[#111111] mb-5 tracking-tight">Payment Metrics</h2>
      <div className="flex flex-wrap gap-6">
        <MetricItem label="Total Payments" value={payments.totalPayments.toLocaleString('en-IN')} />
        <MetricItem label="Paid" value={payments.paidOrders.toLocaleString('en-IN')} />
        <MetricItem label="Pending" value={payments.pendingPayments.toLocaleString('en-IN')} />
        <MetricItem label="Failed" value={payments.failedPayments.toLocaleString('en-IN')} />
        <MetricItem label="Refunded" value={payments.refundedPayments.toLocaleString('en-IN')} />
      </div>
    </div>
  );
}
