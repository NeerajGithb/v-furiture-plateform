'use client';

import {
  useAdminReviews,
  useAdminReviewStats,
  useUpdateAdminReviewStatus,
  useDeleteAdminReview,
} from '../../../hooks/admin/useAdminReviews';
import { useReviewUIStore } from '@/stores/admin/reviewStore';
import { useConfirm } from '@/contexts/ConfirmContext';
import { LoaderGuard } from '@/components/ui/LoaderGuard';
import { Pagination } from '@/components/ui/Pagination';
import PageHeader from '@/components/PageHeader';
import ReviewsOverview from './components/ReviewsOverview';
import ReviewsTable from './components/ReviewsTable';

export default function AdminReviewsPage() {
  const currentPage = useReviewUIStore(s => s.currentPage);
  const setCurrentPage = useReviewUIStore(s => s.setCurrentPage);
  const selectedReviews = useReviewUIStore(s => s.selectedReviews);
  const setSelectedReviews = useReviewUIStore(s => s.setSelectedReviews);

  const { data: reviewsData, isPending, error, refetch, isFetching } = useAdminReviews();
  const { data: stats, isPending: statsPending } = useAdminReviewStats();
  const { mutate: updateReview } = useUpdateAdminReviewStatus();
  const { mutate: deleteReview } = useDeleteAdminReview();
  const { confirm } = useConfirm();

  const allReviews = reviewsData?.data || [];

  const handleSelectReview = (reviewId: string) => {
    const newSelection = selectedReviews.includes(reviewId)
      ? selectedReviews.filter(id => id !== reviewId)
      : [...selectedReviews, reviewId];
    setSelectedReviews(newSelection);
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedReviews(selected ? allReviews.map(r => r.id) : []);
  };

  const handleUpdateStatus = (reviewId: string, status: string) => {
    updateReview({ reviewId, data: { status: status as 'pending' | 'approved' | 'rejected' } });
  };

  const handleDeleteReview = (reviewId: string) => {
    confirm({
      title: 'Delete Review',
      message: 'Are you sure you want to delete this review? This action cannot be undone.',
      type: 'delete',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        deleteReview(reviewId);
      }
    });
  };

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Moderate and manage customer reviews"
        onRefresh={refetch}
        isRefreshing={isFetching}
      />

      <LoaderGuard 
        isLoading={isPending} 
        error={error} 
        isEmpty={!reviewsData || (reviewsData.pagination?.total || 0) === 0}
        emptyMessage="No reviews"
      >
        {() => (
          <>
            <ReviewsOverview
              stats={stats}
              isLoading={statsPending}
              onNavigate={() => { }}
            />

            <ReviewsTable
              reviews={reviewsData!.data}
              selectedReviews={selectedReviews}
              onSelectReview={handleSelectReview}
              onSelectAll={handleSelectAll}
              onUpdateStatus={handleUpdateStatus}
              onDeleteReview={handleDeleteReview}
            />

            <Pagination 
              pagination={reviewsData!.pagination}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </LoaderGuard>
    </>
  );
}
