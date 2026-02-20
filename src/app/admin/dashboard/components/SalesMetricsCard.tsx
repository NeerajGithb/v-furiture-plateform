import type { SalesMetrics } from '@/types/admin/dashboard';
import MetricItem from './MetricItem';

interface SalesMetricsCardProps {
  sales: SalesMetrics;
}

export default function SalesMetricsCard({ sales }: SalesMetricsCardProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
      <h2 className="text-[15px] font-semibold text-[#111111] mb-5 tracking-tight">Sales Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricItem label="Today" value={`₹${sales.todayRevenue.toLocaleString('en-IN')}`} />
        <MetricItem label="This Week" value={`₹${sales.weekRevenue.toLocaleString('en-IN')}`} />
        <MetricItem label="This Month" value={`₹${sales.monthRevenue.toLocaleString('en-IN')}`} />
        <MetricItem label="This Year" value={`₹${sales.yearRevenue.toLocaleString('en-IN')}`} />
      </div>
    </div>
  );
}
