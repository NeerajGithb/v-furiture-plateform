import type { ReviewMetrics } from '@/types/admin/dashboard';
import MetricItem from './MetricItem';

interface ReviewMetricsCardProps {
  reviews: ReviewMetrics;
}

export default function ReviewMetricsCard({ reviews }: ReviewMetricsCardProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
      <h2 className="text-[15px] font-semibold text-[#111111] mb-5 tracking-tight">Review Metrics</h2>
      <div className="flex flex-wrap gap-6">
        <MetricItem label="Total Reviews" value={reviews.totalReviews.toLocaleString('en-IN')} />
        <MetricItem label="Pending" value={reviews.pendingReviews.toLocaleString('en-IN')} />
        <MetricItem label="Approved" value={reviews.approvedReviews.toLocaleString('en-IN')} />
        <MetricItem label="Rejected" value={reviews.rejectedReviews.toLocaleString('en-IN')} />
        <MetricItem label="Avg Rating" value={reviews.averageRating.toFixed(1)} />
      </div>
    </div>
  );
}
