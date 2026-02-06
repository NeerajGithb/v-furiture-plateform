import { BasePrivateService } from "../baseService";
import { 
  AdminReview,
  AdminReviewsQuery,
  AdminReviewUpdate,
  AdminReviewBulkUpdate,
  AdminReviewStats
} from "@/types/review";

interface ReviewsResponse {
  reviews: AdminReview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class AdminReviewsService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  // Get admin reviews with pagination and filters
  async getReviews(params: AdminReviewsQuery = {}): Promise<ReviewsResponse> {
    const response = await this.get<ReviewsResponse>("/admin/reviews", params);

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch reviews.",
      );
    }
  }

  // Get review statistics
  async getReviewStats(): Promise<AdminReviewStats> {
    const response = await this.get<{ stats: AdminReviewStats }>("/admin/reviews", { action: "stats" });

    if (response.success) {
      return response.data!.stats;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch review statistics.",
      );
    }
  }

  // Get single review by ID
  async getReviewById(reviewId: string): Promise<AdminReview> {
    const response = await this.get<{ review: AdminReview }>(`/admin/reviews/${reviewId}`);

    if (response.success) {
      return response.data!.review;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch review.",
      );
    }
  }

  // Update review status (approve/reject)
  async updateReviewStatus(reviewId: string, data: AdminReviewUpdate): Promise<AdminReview> {
    const response = await this.patch<{ review: AdminReview }>(`/admin/reviews/${reviewId}`, data);

    if (response.success) {
      return response.data!.review;
    } else {
      throw new Error(
        response.error?.message || "Failed to update review.",
      );
    }
  }

  // Delete review
  async deleteReview(reviewId: string): Promise<void> {
    const response = await this.delete(`/admin/reviews/${reviewId}`);

    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to delete review.",
      );
    }
  }

  // Bulk update reviews
  async bulkUpdateReviews(data: AdminReviewBulkUpdate): Promise<{ modifiedCount: number; message: string }> {
    const response = await this.patch<{ modifiedCount: number; message: string }>("/admin/reviews", {
      action: "bulk",
      ...data,
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to bulk update reviews.",
      );
    }
  }

  // Export reviews
  async exportReviews(options: any): Promise<any> {
    const response = await this.get("/admin/reviews", { action: "export", ...options });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to export reviews.",
      );
    }
  }
}

// Export singleton instance
export const adminReviewsService = new AdminReviewsService();