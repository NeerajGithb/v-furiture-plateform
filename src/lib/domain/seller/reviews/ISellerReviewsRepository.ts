import { SellerReviewsQuery, RespondToReviewRequest, ReportReviewRequest } from "./SellerReviewsSchemas";

export interface ReviewData {
  _id: string;
  productId: {
    _id: string;
    name: string;
    images: string[];
  };
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  rating: number;
  comment: string;
  response?: string;
  responseDate?: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
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
  responseRate: number;
  averageResponseTime: number;
}

export interface ReviewsResult {
  data: {
    reviews: ReviewData[];
    stats: ReviewStats;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ISellerReviewsRepository {
  getReviews(sellerId: string, query: SellerReviewsQuery): Promise<ReviewsResult>;
  getReviewById(reviewId: string, sellerId: string): Promise<ReviewData | null>;
  respondToReview(reviewId: string, sellerId: string, data: RespondToReviewRequest): Promise<ReviewData>;
  reportReview(reviewId: string, sellerId: string, data: ReportReviewRequest): Promise<void>;
  exportReviews(sellerId: string, query: SellerReviewsQuery): Promise<ReviewData[]>;
}