import type { SellerMetrics } from '@/types/admin/dashboard';
import MetricItem from './MetricItem';

interface SellerMetricsCardProps {
  sellers: SellerMetrics;
}

export default function SellerMetricsCard({ sellers }: SellerMetricsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Seller Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricItem label="Total Sellers" value={sellers.totalSellers.toLocaleString('en-IN')} />
        <MetricItem label="Active" value={sellers.activeSellers.toLocaleString('en-IN')} />
        <MetricItem label="Pending" value={sellers.pendingSellers.toLocaleString('en-IN')} />
        <MetricItem label="Suspended" value={sellers.suspendedSellers.toLocaleString('en-IN')} />
        <MetricItem label="Verified" value={sellers.verifiedSellers.toLocaleString('en-IN')} />
        <MetricItem label="Inactive" value={sellers.inactiveSellers.toLocaleString('en-IN')} />
      </div>
    </div>
  );
}
