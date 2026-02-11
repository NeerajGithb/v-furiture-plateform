// Seller Review Types
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export interface ReviewUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ReviewProduct {
  _id: string;
  name: string;
  mainImage?: {
    url: string;
    alt?: string;
  };
  slug?: string;
  sku?: string;
}

export interface SellerReviewResponse {
  message: string;
  respondedAt: string;
  updatedAt?: string;
}

export interface SellerReview {
  _id: string;
  productId: ReviewProduct;
  userId: ReviewUser;
  rating: ReviewRating;
  comment: string;
  status: ReviewStatus;
  isVerifiedPurchase: boolean;
  sellerResponse?: SellerReviewResponse;
  createdAt: string;
  updatedAt: string;
  helpfulVotes?: number;
  images?: string[];
  pros?: string[];
  cons?: string[];
  wouldRecommend?: boolean;
}

export interface SellerReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  avgRating: number;
  verifiedPurchases: number;
  totalReviews: number;
  averageRating: number;
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
}

export interface SellerReviewsResponse {
  reviews: SellerReview[];
  stats?: SellerReviewStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SellerReviewFilters {
  status?: ReviewStatus;
  rating?: ReviewRating;
  search?: string;
  period?: string;
  productId?: string;
  userId?: string;
  verifiedPurchase?: boolean;
  hasResponse?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ReviewsQuery {
  status?: ReviewStatus;
  rating?: ReviewRating;
  search?: string;
  period?: string;
  productId?: string;
  userId?: string;
  verifiedPurchase?: boolean;
  hasResponse?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RespondToReviewRequest {
  response: string;
}

export interface ReportReviewRequest {
  reason: string;
  description?: string;
}

export interface ReviewResponseData {
  message: string;
}

export interface ReviewResponseUpdateData {
  message: string;
}

// UI State interfaces
export interface SellerReviewUIState {
  expandedReview: string | null;
  respondingToReview: string | null;
  editingResponse: string | null;
  showFilters: boolean;
  setExpandedReview: (reviewId: string | null) => void;
  setRespondingToReview: (reviewId: string | null) => void;
  setEditingResponse: (reviewId: string | null) => void;
  setShowFilters: (show: boolean) => void;
  resetState: () => void;
}

// Component Props interfaces
export interface ReviewsHeaderProps {
  onExport: () => void;
  isExporting: boolean;
  stats?: SellerReviewStats;
}

export interface ReviewsStatsProps {
  stats?: SellerReviewStats;
}

export interface ReviewsFiltersProps {
  statusFilter: string;
  ratingFilter: string;
  onStatusChange: (status: string) => void;
  onRatingChange: (rating: string) => void;
  onClearFilters: () => void;
}

export interface ReviewsListProps {
  reviews: SellerReview[];
  onRespond: (reviewId: string, message: string) => Promise<void>;
  onUpdateResponse: (reviewId: string, message: string) => Promise<void>;
  onDeleteResponse: (reviewId: string) => Promise<void>;
  isResponding: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export interface ReviewsPaginationProps {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  currentPage: number;
  onPageChange: (page: number) => void;
}

// Individual Review Component Props
export interface ReviewCardProps {
  review: SellerReview;
  onRespond: (reviewId: string, message: string) => void;
  onUpdateResponse: (reviewId: string, message: string) => void;
  onDeleteResponse: (reviewId: string) => void;
  isResponding: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isExpanded?: boolean;
  onToggleExpand?: (reviewId: string) => void;
}

export interface ReviewResponseFormProps {
  reviewId: string;
  existingResponse?: SellerReviewResponse;
  onSubmit: (reviewId: string, message: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
}

export interface ReviewRatingDisplayProps {
  rating: ReviewRating;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

export interface ReviewStatusBadgeProps {
  status: ReviewStatus;
  size?: 'sm' | 'md';
}

export interface ReviewMetricsProps {
  review: SellerReview;
  showDetails?: boolean;
}

// Analytics and Reporting interfaces
export interface ReviewAnalytics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  responseRate: number;
  averageResponseTime: number;
  verifiedPurchaseRate: number;
  monthlyTrends: {
    month: string;
    reviews: number;
    rating: number;
  }[];
}

export interface ReviewAnalyticsProps {
  analytics: ReviewAnalytics;
  period: string;
  onPeriodChange: (period: string) => void;
}

// Bulk Operations interfaces
export interface BulkReviewAction {
  reviewIds: string[];
  action: 'respond' | 'delete_response';
  data?: any;
}

export interface BulkReviewActionsProps {
  selectedReviews: string[];
  onBulkRespond: (reviewIds: string[], message: string) => void;
  onBulkDeleteResponse: (reviewIds: string[]) => void;
  onClearSelection: () => void;
  isProcessing: boolean;
}

// Review Templates interfaces
export interface ReviewTemplate {
  _id: string;
  name: string;
  message: string;
  category: string;
  isDefault: boolean;
  createdAt: string;
}

export interface ReviewTemplatesProps {
  templates: ReviewTemplate[];
  onSelectTemplate: (template: ReviewTemplate) => void;
  onCreateTemplate: (template: Omit<ReviewTemplate, '_id' | 'createdAt'>) => void;
  onUpdateTemplate: (templateId: string, updates: Partial<ReviewTemplate>) => void;
  onDeleteTemplate: (templateId: string) => void;
}