import { ISellerReviewsRepository, ReviewsResult, ReviewData } from "./ISellerReviewsRepository";
import { SellerReviewsRepository } from "./SellerReviewsRepository";
import { SellerReviewsQuery, RespondToReviewRequest, ReportReviewRequest } from "./SellerReviewsSchemas";

export class SellerReviewsService {
  constructor(private repository: ISellerReviewsRepository = new SellerReviewsRepository()) {}

  async getReviews(sellerId: string, query: SellerReviewsQuery): Promise<ReviewsResult> {
    return await this.repository.getReviews(sellerId, query);
  }

  async getReviewById(reviewId: string, sellerId: string): Promise<ReviewData | null> {
    return await this.repository.getReviewById(reviewId, sellerId);
  }

  async respondToReview(reviewId: string, sellerId: string, data: RespondToReviewRequest): Promise<ReviewData> {
    return await this.repository.respondToReview(reviewId, sellerId, data);
  }

  async reportReview(reviewId: string, sellerId: string, data: ReportReviewRequest): Promise<void> {
    return await this.repository.reportReview(reviewId, sellerId, data);
  }

  async exportReviews(sellerId: string, query: SellerReviewsQuery): Promise<ReviewData[]> {
    return await this.repository.exportReviews(sellerId, query);
  }
}

// Create default instance
export const sellerReviewsService = new SellerReviewsService();