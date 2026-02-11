import { BasePrivateService } from "../baseService";
import { 
  SellerReview,
  ReviewsQuery,
  RespondToReviewRequest
} from "@/types/seller/reviews";

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

  async getReviews(params: ReviewsQuery = {}): Promise<ReviewsResponse> {
    const response: any = await this.get("/seller/reviews", params);

    if (response.success) {
      return {
        reviews: response.data || [],
        stats: response.meta?.stats || {
          totalReviews: 0,
          averageRating: 0,
          breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          pendingReviews: 0,
          responseRate: 0,
          averageResponseTime: 0
        },
        pagination: {
          page: response.pagination?.page || 1,
          limit: response.pagination?.limit || 20,
          total: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 0,
          hasNext: response.pagination?.hasNext || false,
          hasPrev: response.pagination?.hasPrev || false,
        },
      };
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch reviews.",
      );
    }
  }

  async exportReviews(params: ReviewsQuery = {}): Promise<SellerReview[]> {
    const response: any = await this.get("/seller/reviews", { 
      action: "export", 
      ...params 
    });

    if (response.success) {
      return response.data?.reviews || [];
    } else {
      throw new Error(
        response.error?.message || "Failed to export reviews.",
      );
    }
  }

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
}

export const sellerReviewsService = new SellerReviewsService();