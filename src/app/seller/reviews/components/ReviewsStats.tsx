import { Star, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';

interface ReviewsStatsProps {
  stats?: {
    total?: number;
    totalReviews?: number;
    averageRating?: number;
    avgRating?: number;
    pending?: number;
    pendingReviews?: number;
    approved?: number;
    approvedReviews?: number;
    rejected?: number;
    rejectedReviews?: number;
  };
}

export function ReviewsStats({ stats }: ReviewsStatsProps) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-500">Total</span>
          <MessageSquare className="w-4 h-4 text-gray-400" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.totalReviews || stats.total || 0}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-500">Average</span>
          <Star className="w-4 h-4 text-amber-500" />
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {stats.averageRating ? stats.averageRating.toFixed(1) : (stats.avgRating ? stats.avgRating.toFixed(1) : '0.0')}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-500">Pending</span>
          <Clock className="w-4 h-4 text-orange-500" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.pendingReviews || stats.pending || 0}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-500">Approved</span>
          <CheckCircle className="w-4 h-4 text-emerald-500" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.approvedReviews || stats.approved || 0}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-500">Rejected</span>
          <XCircle className="w-4 h-4 text-rose-500" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats.rejectedReviews || stats.rejected || 0}</p>
      </div>
    </div>
  );
}
