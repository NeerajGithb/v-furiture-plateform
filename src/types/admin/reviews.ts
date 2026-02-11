// Re-export types from backend domain layer for frontend use
export type {
    AdminReview,
    ReviewStats,
} from '@/lib/domain/admin/reviews/IAdminReviewsRepository';

export type {
    AdminReviewsQueryRequest,
    ReviewStatusUpdateRequest,
    ReviewStatsQueryRequest,
    ReviewExportRequest,
} from '@/lib/domain/admin/reviews/AdminReviewsSchemas';

// Additional types for frontend operations
export interface AdminReviewUpdate {
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
}

export interface AdminReviewBulkUpdate {
  reviewIds: string[];
  status: 'approved' | 'rejected';
  reason?: string;
}
