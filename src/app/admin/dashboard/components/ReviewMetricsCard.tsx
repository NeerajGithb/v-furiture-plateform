import type { ReviewMetrics } from '@/types/admin/dashboard';
import MetricItem from './MetricItem';

interface ReviewMetricsCardProps {
  reviews: ReviewMetrics;
}

export default function ReviewMetricsCard({ reviews }: ReviewMetricsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Review Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <MetricItem label="Total Reviews" value={reviews.totalReviews.toLocaleString('en-IN')} />
        <MetricItem label="Pending" value={reviews.pendingReviews.toLocaleString('en-IN')} />
        <MetricItem label="Approved" value={reviews.approvedReviews.toLocaleString('en-IN')} />
        <MetricItem label="Rejected" value={reviews.rejectedReviews.toLocaleString('en-IN')} />
        <MetricItem label="Avg Rating" value={reviews.averageRating.toFixed(1)} />
      </div>
    </div>
  );
}
