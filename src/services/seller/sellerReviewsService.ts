import { BasePrivateService } from "../baseService";
import { 
  SellerReview,
  ReviewsQuery,
  RespondToReviewRequest,
  ReportReviewRequest
} from "@/types/sellerReview";

interface ReviewsResponse {
  reviews: SellerReview[];
  stats: {
    totalReviews: number;
    averageRating: number;
    breakdown: { 5: number; 4: number; 3: number; 2: number; 1: number };
    pendingReviews: number;
    responseRate: number;
    averageResponseTime: number;
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

class SellerReviewsService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  // Get reviews with pagination and filters
  async getReviews(params: ReviewsQuery = {}): Promise<ReviewsResponse> {
    const response = await this.get<ReviewsResponse>("/seller/reviews", params);

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch reviews.",
      );
    }
  }

  // Export reviews
  async exportReviews(params: ReviewsQuery = {}): Promise<SellerReview[]> {
    const response = await this.get<{ reviews: SellerReview[] }>("/seller/reviews", { 
      action: "export", 
      ...params 
    });

    if (response.success) {
      return response.data!.reviews;
    } else {
      throw new Error(
        response.error?.message || "Failed to export reviews.",
      );
    }
  }

  // Get single review by ID
  async getReviewById(reviewId: string): Promise<SellerReview> {
    const response = await this.get<{ review: SellerReview }>(`/seller/reviews/${reviewId}`);

    if (response.success) {
      return response.data!.review;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch review.",
      );
    }
  }

  // Respond to review
  async respondToReview(reviewId: string, data: RespondToReviewRequest): Promise<SellerReview> {
    const response = await this.patch<{ review: SellerReview }>(`/seller/reviews/${reviewId}`, {
      action: "respond",
      ...data,
    });

    if (response.success) {
      return response.data!.review;
    } else {
      throw new Error(
        response.error?.message || "Failed to respond to review.",
      );
    }
  }

  // Report review
  async reportReview(reviewId: string, data: ReportReviewRequest): Promise<void> {
    const response = await this.patch(`/seller/reviews/${reviewId}`, {
      action: "report",
      ...data,
    });

    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to report review.",
      );
    }
  }
}

// Export singleton instance
export const sellerReviewsService = new SellerReviewsService();