import type { SalesMetrics } from '@/types/admin/dashboard';
import MetricItem from './MetricItem';

interface SalesMetricsCardProps {
  sales: SalesMetrics;
}

export default function SalesMetricsCard({ sales }: SalesMetricsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Sales Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricItem label="Today" value={`₹${sales.todayRevenue.toLocaleString('en-IN')}`} />
        <MetricItem label="This Week" value={`₹${sales.weekRevenue.toLocaleString('en-IN')}`} />
        <MetricItem label="This Month" value={`₹${sales.monthRevenue.toLocaleString('en-IN')}`} />
        <MetricItem label="This Year" value={`₹${sales.yearRevenue.toLocaleString('en-IN')}`} />
      </div>
    </div>
  );
}
