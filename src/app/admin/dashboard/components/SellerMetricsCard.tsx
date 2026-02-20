import type { SellerMetrics } from '@/types/admin/dashboard';
import MetricItem from './MetricItem';

interface SellerMetricsCardProps {
  sellers: SellerMetrics;
}

export default function SellerMetricsCard({ sellers }: SellerMetricsCardProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
      <h2 className="text-[15px] font-semibold text-[#111111] mb-5 tracking-tight">Seller Metrics</h2>
      <div className="flex flex-wrap gap-6">
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
