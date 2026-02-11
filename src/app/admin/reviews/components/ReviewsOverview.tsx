import {
  Star, MessageSquare, CheckCircle, XCircle, Clock, AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { ReviewStats } from '@/types/admin/reviews';

interface ReviewsOverviewProps {
  stats?: ReviewStats;
  isLoading?: boolean;
  onNavigate: (tab: string) => void;
}

export default function ReviewsOverview({ stats, isLoading, onNavigate }: ReviewsOverviewProps) {
  const getPercentage = (value: number, total: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
  };

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Reviews */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Total Reviews</p>
            <MessageSquare className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalReviews.toLocaleString()}</p>
        </div>

        {/* Average Rating */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Average Rating</p>
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${star <= Math.round(stats.averageRating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-200'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-gray-900">{stats.pendingReviews.toLocaleString()}</p>
            <p className="text-xs text-amber-600 font-medium mb-1">
              {getPercentage(stats.pendingReviews, stats.totalReviews)}%
            </p>
          </div>
        </div>

        {/* Approved Reviews */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Approved Reviews</p>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-gray-900">{stats.approvedReviews.toLocaleString()}</p>
            <p className="text-xs text-green-600 font-medium mb-1">
              {getPercentage(stats.approvedReviews, stats.totalReviews)}%
            </p>
          </div>
        </div>
      </div>

      {/* Rating Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gray-500" />
          Rating Breakdown
        </h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.breakdown[rating as keyof typeof stats.breakdown] || 0;
            const percentage = getPercentage(count, stats.totalReviews);

            return (
              <div key={rating} className="flex items-center gap-4">
                <div className="flex items-center gap-1 w-12 text-sm text-gray-600">
                  <span>{rating}</span>
                  <Star className="w-3 h-3 text-gray-400" />
                </div>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="bg-gray-900 h-full rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-end gap-2 w-16">
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                  <span className="text-xs text-gray-400">({Math.round(Number(percentage))}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}