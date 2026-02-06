// Review Types for Admin System
import { ReviewStatus } from './common';

export interface ReviewUser {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  avatar?: string;
}

export interface ReviewProduct {
  _id: string;
  name: string;
  sku?: string;
  mainImage?: {
    url: string;
    alt: string;
  };
  slug?: string;
}

export interface ReviewSeller {
  _id: string;
  businessName: string;
  email: string;
  phone?: string;
}

export interface ReviewReport {
  _id: string;
  userId: string;
  reason: string;
  description?: string;
  createdAt: string;
}

export interface AdminReview {
  _id: string;
  userId: ReviewUser;
  productId: ReviewProduct;
  sellerId?: ReviewSeller;
  rating: number;
  title?: string;
  comment: string;
  status: ReviewStatus;
  reports?: ReviewReport[];
  createdAt: string;
  updatedAt: string;
  product?: ReviewProduct;
  seller?: ReviewSeller;
  helpfulVotes?: number;
  verifiedPurchase?: boolean;
  images?: string[];
  pros?: string[];
  cons?: string[];
  wouldRecommend?: boolean;
  moderatedBy?: string;
  moderatedAt?: string;
  rejectionReason?: string;
}

export interface ReviewStats {
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
  reportedReviews: number;
  verifiedPurchases: number;
  averageHelpfulVotes: number;
}

export interface ReviewsResponse {
  reviews: AdminReview[];
  stats?: ReviewStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ReviewFilters {
  status?: ReviewStatus;
  rating?: number;
  search?: string;
  period?: string;
  productId?: string;
  sellerId?: string;
  userId?: string;
  verifiedPurchase?: boolean;
  hasReports?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ReviewUpdateData {
  status?: ReviewStatus;
  rejectionReason?: string;
  moderatedBy?: string;
}

// UI State interfaces
export interface ReviewUIState {
  expandedReview: string | null;
  activeTab: string;
  showFilters: boolean;
  selectedReviews: string[];
  showStatusModal: boolean;
  showDeleteModal: boolean;
  showReportModal: boolean;
  setExpandedReview: (reviewId: string | null) => void;
  setActiveTab: (tab: string) => void;
  setShowFilters: (show: boolean) => void;
  setSelectedReviews: (reviews: string[]) => void;
  toggleReviewSelection: (reviewId: string) => void;
  selectAllReviews: (reviewIds: string[]) => void;
  clearSelection: () => void;
  setShowStatusModal: (show: boolean) => void;
  setShowDeleteModal: (show: boolean) => void;
  setShowReportModal: (show: boolean) => void;
}

// Component Props interfaces
export interface ReviewsOverviewProps {
  stats: ReviewStats;
  onTabChange: (tab: string) => void;
  activeTab: string;
}

export interface ReviewsTableProps {
  reviews: AdminReview[];
  expandedReview: string | null;
  onToggleExpand: (reviewId: string) => void;
  selectedReviews: string[];
  onToggleSelection: (reviewId: string) => void;
  onSelectAll: (reviewIds: string[]) => void;
  onUpdateStatus: (reviewId: string, status: ReviewStatus) => void;
  onDeleteReview: (reviewId: string) => void;
}

// Admin Review Types
export interface AdminReviewsQuery {
  status?: ReviewStatus;
  rating?: number;
  search?: string;
  period?: string;
  productId?: string;
  sellerId?: string;
  userId?: string;
  verifiedPurchase?: boolean;
  hasReports?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AdminReviewUpdate {
  status?: ReviewStatus;
  rejectionReason?: string;
  moderatedBy?: string;
  moderatedAt?: string;
}

export interface AdminReviewBulkUpdate {
  reviewIds: string[];
  status?: ReviewStatus;
  rejectionReason?: string;
  moderatedBy?: string;
}

export interface AdminReviewStats {
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
  reportedReviews: number;
  verifiedPurchases: number;
  averageHelpfulVotes: number;
}