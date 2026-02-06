'use client';

import { useState } from 'react';
import { useGlobalFilterStore } from '@/stores/globalFilterStore';
import { 
  useSellerReviews, 
  useRespondToReview,
  useExportSellerReviews
} from '@/hooks/seller/useSellerReviews';
import { ReviewStatus, ReviewRating } from '@/types/sellerReview';
import { ReviewsSkeleton } from './components/ReviewsSkeleton';
import { ReviewsHeader } from './components/ReviewsHeader';
import { ReviewsFilters } from './components/ReviewsFilters';
import { ReviewsList } from './components/ReviewsList';
import { ReviewsPagination } from './components/ReviewsPagination';

export default function SellerReviewsPage() {
  const [ratingFilter, setRatingFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Global filters
  const { 
    search: globalSearch,
    status: statusFilter,
    page,
    setStatus: setStatusFilter,
    setPage,
    clearFilters
  } = useGlobalFilterStore();

  // React Query hooks
  const { data: reviewsData, isLoading, refetch } = useSellerReviews({
    page,
    limit: 20,
    search: globalSearch,
    status: statusFilter !== 'all' ? (statusFilter as ReviewStatus) : undefined,
    rating: ratingFilter !== 'all' ? (parseInt(ratingFilter) as ReviewRating) : undefined
  });

  const respondToReview = useRespondToReview();
  const exportReviews = useExportSellerReviews();

  const reviews = reviewsData?.reviews || [];
  const pagination = reviewsData?.pagination;
  const stats = reviewsData?.stats;

  // Handlers
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleExport = async () => {
    await exportReviews.mutateAsync({
      status: statusFilter !== 'all' ? (statusFilter as ReviewStatus) : undefined,
      rating: ratingFilter !== 'all' ? (parseInt(ratingFilter) as ReviewRating) : undefined,
      search: globalSearch
    });
  };

  const handleRespond = async (reviewId: string, message: string) => {
    await respondToReview.mutateAsync({
      reviewId,
      data: { response: message }
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <>
      {isLoading && <ReviewsSkeleton />}
      {!isLoading && (
        <div className="space-y-6 max-w-7xl mx-auto p-6">
          <ReviewsHeader 
            stats={stats}
            onExport={handleExport}
            onRefresh={handleRefresh}
            isExporting={exportReviews.isPending}
            refreshing={refreshing}
          />

          <ReviewsFilters
            statusFilter={statusFilter || 'all'}
            ratingFilter={ratingFilter}
            onStatusChange={setStatusFilter}
            onRatingChange={setRatingFilter}
          />

          <ReviewsList
            reviews={reviews}
            onRespond={handleRespond}
            isResponding={respondToReview.isPending}
          />

          {pagination && pagination.totalPages > 1 && (
            <ReviewsPagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </>
  );
}