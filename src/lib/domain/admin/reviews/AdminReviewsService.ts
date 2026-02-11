import { IAdminReviewsRepository, AdminReview, ReviewStats } from "./IAdminReviewsRepository";
import { AdminReviewsRepository } from "./AdminReviewsRepository";
import { 
  AdminReviewsQueryRequest,
  ReviewStatusUpdateRequest,
  ReviewStatsQueryRequest,
  ReviewExportRequest
} from "./AdminReviewsSchemas";
import {
  ReviewNotFoundError,
  ReviewValidationError,
  ReviewOperationError,
} from "./AdminReviewsErrors";
import { PaginationResult } from "../../shared/types";

export class AdminReviewsService {
  constructor(
    private repository: IAdminReviewsRepository = new AdminReviewsRepository(),
  ) {}

  async getReviews(query: AdminReviewsQueryRequest): Promise<PaginationResult<AdminReview>> {
    return await this.repository.findMany(query);
  }

  async getReviewById(id: string): Promise<AdminReview> {
    const review = await this.repository.findById(id);
    if (!review) {
      throw new ReviewNotFoundError(id);
    }
    return review;
  }

  async updateReviewStatus(request: ReviewStatusUpdateRequest): Promise<AdminReview> {
    const review = await this.repository.findById(request.reviewId);
    if (!review) {
      throw new ReviewNotFoundError(request.reviewId);
    }

    if (request.status === 'rejected' && !request.reason) {
      throw new ReviewValidationError("reason", "Rejection reason is required");
    }

    return await this.repository.updateStatus(request.reviewId, request.status, request.reason);
  }

  async deleteReview(id: string): Promise<void> {
    const review = await this.repository.findById(id);
    if (!review) {
      throw new ReviewNotFoundError(id);
    }

    await this.repository.delete(id);
  }

  async getReviewStats(query: ReviewStatsQueryRequest): Promise<ReviewStats> {
    return await this.repository.getStats(query.period);
  }

  async exportReviews(request: ReviewExportRequest): Promise<AdminReview[]> {
    return await this.repository.exportReviews(request);
  }

  async bulkUpdateReviews(request: { reviewIds: string[]; updates: any }): Promise<{ updatedCount: number }> {
    let updatedCount = 0;
    for (const reviewId of request.reviewIds) {
      try {
        if (request.updates.status) {
          await this.repository.updateStatus(reviewId, request.updates.status, request.updates.reason);
          updatedCount++;
        }
      } catch (error) {
        // Continue with other reviews even if one fails
        console.error(`Failed to update review ${reviewId}:`, error);
      }
    }
    return { updatedCount };
  }
}

// Export singleton instance
export const adminReviewsService = new AdminReviewsService();