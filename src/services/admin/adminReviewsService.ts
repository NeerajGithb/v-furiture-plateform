import { BasePrivateService } from "../baseService";
import { 
  AdminReview,
  AdminReviewUpdate,
  AdminReviewBulkUpdate,
  ReviewStats,
  AdminReviewsQueryRequest
} from "@/types/admin/reviews";
import { PaginationResult } from '@/lib/domain/shared/types';

class AdminReviewsService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  async getReviews(params: Partial<AdminReviewsQueryRequest> = {}): Promise<PaginationResult<AdminReview>> {
    return await this.getPaginated<AdminReview>("/admin/reviews", params);
  }

  async getReviewStats(period?: string): Promise<ReviewStats> {
    const params: any = { stats: "true" };
    if (period) params.period = period;
    
    const response = await this.get("/admin/reviews", params);

    if (response.success) {
      return response.data as ReviewStats;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch review statistics.",
      );
    }
  }

  async updateReviewStatus(reviewId: string, data: AdminReviewUpdate): Promise<AdminReview> {
    const response = await this.patch(`/admin/reviews/${reviewId}`, {
      action: "updateStatus",
      ...data
    });

    if (response.success) {
      const responseData = response.data as { review: AdminReview };
      return responseData.review;
    } else {
      throw new Error(
        response.error?.message || "Failed to update review.",
      );
    }
  }

  async deleteReview(reviewId: string): Promise<void> {
    const response = await this.delete(`/admin/reviews/${reviewId}`);

    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to delete review.",
      );
    }
  }

  async bulkUpdateReviews(data: AdminReviewBulkUpdate): Promise<{ modifiedCount: number; message: string }> {
    const response = await this.patch("/admin/reviews", {
      action: "bulk",
      ...data,
    });

    if (response.success) {
      return response.data as { modifiedCount: number; message: string };
    } else {
      throw new Error(
        response.error?.message || "Failed to bulk update reviews.",
      );
    }
  }

  async exportReviews(options: { format?: string; filters?: any }): Promise<Blob> {
    const response = await this.post("/admin/reviews", { action: "export", ...options });

    if (response.success) {
      return new Blob([JSON.stringify(response.data)], { type: 'application/json' });
    } else {
      throw new Error(
        response.error?.message || "Failed to export reviews.",
      );
    }
  }
}

export const adminReviewsService = new AdminReviewsService();
