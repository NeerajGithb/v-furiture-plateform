'use client';

import { useState } from 'react';
import {
  RefreshCw, Download
} from 'lucide-react';
import {
  useAdminReviews,
  useAdminReviewStats,
  useUpdateAdminReviewStatus,
  useDeleteAdminReview,
  useExportAdminReviews
} from '@/hooks/admin/useAdminReviews';
import { AdminReviewStats } from '@/types/review';
import ReviewsOverview from './components/ReviewsOverview';
import ReviewsTable from './components/ReviewsTable';
import ReviewsSkeleton from './components/ReviewsSkeleton';

export default function AdminReviewsPage() {
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);

  // React Query hooks
  const { data: reviewsData, isLoading, refetch } = useAdminReviews();
  const { data: stats } = useAdminReviewStats();
  const { mutate: updateReview } = useUpdateAdminReviewStatus();
  const { mutate: deleteReview } = useDeleteAdminReview();
  const { mutate: exportReviews, isPending: exportPending } = useExportAdminReviews();

  const allReviews = reviewsData?.reviews || [];

  const handleSelectReview = (reviewId: string) => {
    setSelectedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedReviews(selected ? allReviews.map(r => r._id) : []);
  };

  const handleUpdateStatus = (reviewId: string, status: string) => {
    updateReview({ reviewId, data: { status: status as 'pending' | 'approved' | 'rejected' } });
  };

  const handleDeleteReview = (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      deleteReview(reviewId);
    }
  };

  const handleExport = () => {
    exportReviews({});
  };

  return (
    <>
      {isLoading && <ReviewsSkeleton />}
      {!isLoading && reviewsData && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
              <p className="text-sm text-gray-500 mt-1">Moderate and manage customer reviews</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium text-gray-700"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                disabled={exportPending}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium text-gray-700"
              >
                <Download className="w-4 h-4" />
                {exportPending ? 'Exporting...' : 'Export'}
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          {stats && (
            <ReviewsOverview 
              stats={stats as AdminReviewStats} 
              onNavigate={() => {}} 
            />
          )}

          {/* Reviews Table */}
          <ReviewsTable
            reviews={allReviews}
            selectedReviews={selectedReviews}
            onSelectReview={handleSelectReview}
            onSelectAll={handleSelectAll}
            onUpdateStatus={handleUpdateStatus}
            onDeleteReview={handleDeleteReview}
          />
        </div>
      )}
    </>
  );
}