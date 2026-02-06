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
    try {
      return await this.repository.findMany(query);
    } catch (error) {
      throw new ReviewOperationError("getReviews", (error as Error).message);
    }
  }

  async getReviewById(id: string): Promise<AdminReview> {
    try {
      const review = await this.repository.findById(id);
      if (!review) {
        throw new ReviewNotFoundError(id);
      }
      return review;
    } catch (error) {
      if (error instanceof ReviewNotFoundError) {
        throw error;
      }
      throw new ReviewOperationError("getReviewById", (error as Error).message);
    }
  }

  async updateReviewStatus(request: ReviewStatusUpdateRequest): Promise<AdminReview> {
    try {
      const review = await this.repository.findById(request.reviewId);
      if (!review) {
        throw new ReviewNotFoundError(request.reviewId);
      }

      if (request.status === 'rejected' && !request.reason) {
        throw new ReviewValidationError("reason", "Rejection reason is required");
      }

      return await this.repository.updateStatus(request.reviewId, request.status, request.reason);
    } catch (error) {
      if (error instanceof ReviewNotFoundError || error instanceof ReviewValidationError) {
        throw error;
      }
      throw new ReviewOperationError("updateReviewStatus", (error as Error).message);
    }
  }

  async deleteReview(id: string): Promise<void> {
    try {
      const review = await this.repository.findById(id);
      if (!review) {
        throw new ReviewNotFoundError(id);
      }

      await this.repository.delete(id);
    } catch (error) {
      if (error instanceof ReviewNotFoundError) {
        throw error;
      }
      throw new ReviewOperationError("deleteReview", (error as Error).message);
    }
  }

  async getReviewStats(query: ReviewStatsQueryRequest): Promise<ReviewStats> {
    try {
      return await this.repository.getStats(query.period);
    } catch (error) {
      throw new ReviewOperationError("getReviewStats", (error as Error).message);
    }
  }

  async exportReviews(request: ReviewExportRequest): Promise<AdminReview[]> {
    try {
      return await this.repository.exportReviews(request);
    } catch (error) {
      throw new ReviewOperationError("exportReviews", (error as Error).message);
    }
  }
}

// Export singleton instance
export const adminReviewsService = new AdminReviewsService();