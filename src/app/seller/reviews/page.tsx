"use client"
import { useReviewsUIStore } from '@/stores/seller/reviewsUIStore';
import { 
  useSellerReviews, 
  useRespondToReview,
  useExportSellerReviews
} from '@/hooks/seller/useSellerReviews';
import { LoaderGuard } from '@/components/ui/LoaderGuard';
import { Pagination } from '@/components/ui/Pagination';
import PageHeader from '@/components/PageHeader';
import { ReviewsStats } from './components/ReviewsStats';
import { ReviewsList } from './components/ReviewsList';

export default function SellerReviewsPage() {
  const currentPage = useReviewsUIStore(s => s.currentPage);
  const setCurrentPage = useReviewsUIStore(s => s.setCurrentPage);

  const { data: reviewsData, isPending, error, refetch, isFetching } = useSellerReviews();
  const respondToReview = useRespondToReview();
  const exportReviews = useExportSellerReviews();

  const reviews = reviewsData?.reviews || [];
  const pagination = reviewsData?.pagination;
  const stats = reviewsData?.stats;

  const handleExport = async () => {
    await exportReviews.mutateAsync({});
  };

  const handleRespond = async (reviewId: string, message: string) => {
    await respondToReview.mutateAsync({
      reviewId,
      data: { response: message }
    });
  };

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Manage feedback from your customers"
        onRefresh={refetch}
        isRefreshing={isFetching}
        actions={
          <button
            onClick={handleExport}
            disabled={exportReviews.isPending}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
          >
            {exportReviews.isPending ? 'Exporting...' : 'Export'}
          </button>
        }
      />

      <LoaderGuard 
        isLoading={isPending} 
        error={error}
        isEmpty={!reviewsData || (reviewsData.pagination?.total || 0) === 0}
        emptyMessage="No reviews"
      >
        {() => (
          <div className="space-y-6 max-w-7xl mx-auto">
            <ReviewsStats stats={stats} />

            <ReviewsList
              reviews={reviews}
              onRespond={handleRespond}
              isResponding={respondToReview.isPending}
            />

            {pagination && pagination.totalPages > 1 && (
              <Pagination
                pagination={pagination}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        )}
      </LoaderGuard>
    </>
  );
}