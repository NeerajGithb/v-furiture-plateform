import { ISellerReviewsRepository, ReviewData, ReviewsResult } from "./ISellerReviewsRepository";
import { SellerReviewsQuery, RespondToReviewRequest, ReportReviewRequest } from "./SellerReviewsSchemas";
import { 
  ReviewNotFoundError, 
  ReviewAlreadyRespondedError
} from "./SellerReviewsErrors";
import { RepositoryError } from "../../shared/InfrastructureError";
import Review from "@/models/Review";
import Product from "@/models/Product";
import { Types } from "mongoose";

export class SellerReviewsRepository implements ISellerReviewsRepository {
  
  private getDateFilter(period: string) {
    const now = new Date();
    let startDate: Date | null = null;

    switch (period) {
      case '30min':
        startDate = new Date(now.getTime() - 30 * 60 * 1000);
        break;
      case '1hour':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24hours':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
      default:
        startDate = null;
        break;
    }

    return startDate ? { createdAt: { $gte: startDate } } : {};
  }

  async getReviews(sellerId: string, query: SellerReviewsQuery): Promise<ReviewsResult> {
    try {
      const page = Math.max(query.page, 1);
      const limit = Math.min(query.limit, 50);

      // Get date filter for the period
      const dateFilter = this.getDateFilter(query.period);

      // Get seller's products
      const sellerProducts = await Product.find({ sellerId: new Types.ObjectId(sellerId) }).select('_id');
      const productIds = sellerProducts.map(p => p._id);

      if (productIds.length === 0) {
        return {
          data: {
            reviews: [],
            stats: {
              totalReviews: 0,
              averageRating: 0,
              breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
              pendingReviews: 0,
              responseRate: 0,
              averageResponseTime: 0
            }
          },
          pagination: {
            page: page,
            limit: limit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        };
      }

      // Build query
      const reviewQuery: any = {
        productId: { $in: productIds },
        ...dateFilter
      };

      if (query.status) {
        reviewQuery.status = query.status;
      }

      if (query.rating) {
        reviewQuery.rating = parseInt(query.rating);
      }

      if (query.productId) {
        reviewQuery.productId = new Types.ObjectId(query.productId);
      }

      if (query.search) {
        reviewQuery.$or = [
          { comment: { $regex: query.search, $options: 'i' } },
          { response: { $regex: query.search, $options: 'i' } }
        ];
      }

      // Get total count
      const totalReviews = await Review.countDocuments(reviewQuery);

      // Get reviews with pagination
      const skip = (page - 1) * limit;
      const reviews = await Review.find(reviewQuery)
        .populate('userId', 'name email')
        .populate('productId', 'name images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Calculate stats
      const allReviews = await Review.find({ productId: { $in: productIds } }).lean();
      const totalCount = allReviews.length;
      const averageRating = totalCount > 0 ? allReviews.reduce((sum, review) => sum + review.rating, 0) / totalCount : 0;

      // Rating breakdown
      const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      allReviews.forEach(review => {
        breakdown[review.rating as keyof typeof breakdown]++;
      });

      // Response stats
      const reviewsWithResponse = allReviews.filter(review => review.response);
      const responseRate = totalCount > 0 ? (reviewsWithResponse.length / totalCount) * 100 : 0;

      // Calculate average response time (in hours)
      const responseTimes = reviewsWithResponse
        .filter(review => review.responseDate)
        .map(review => {
          const reviewDate = new Date(review.createdAt);
          const responseDate = new Date(review.responseDate!);
          return (responseDate.getTime() - reviewDate.getTime()) / (1000 * 60 * 60); // hours
        });

      const averageResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
        : 0;

      const pendingReviews = await Review.countDocuments({
        productId: { $in: productIds },
        response: { $exists: false }
      });

      const totalPages = Math.ceil(totalReviews / limit);

      return {
        data: {
          reviews: reviews as unknown as ReviewData[],
          stats: {
            totalReviews: totalCount,
            averageRating: Math.round(averageRating * 10) / 10,
            breakdown,
            pendingReviews,
            responseRate: Math.round(responseRate * 10) / 10,
            averageResponseTime: Math.round(averageResponseTime * 10) / 10
          }
        },
        pagination: {
          page: page,
          limit: limit,
          total: totalReviews,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };

    } catch (error) {
      throw new RepositoryError("Failed to get reviews", "getReviews", error as Error);
    }
  }

  async getReviewById(reviewId: string, sellerId: string): Promise<ReviewData | null> {
    try {
      // Get seller's products
      const sellerProducts = await Product.find({ sellerId: new Types.ObjectId(sellerId) }).select('_id');
      const productIds = sellerProducts.map(p => p._id);

      const review = await Review.findOne({
        _id: new Types.ObjectId(reviewId),
        productId: { $in: productIds }
      })
        .populate('userId', 'name email')
        .populate('productId', 'name images')
        .lean();

      return review as unknown as ReviewData | null;
    } catch (error) {
      throw new RepositoryError("Failed to get review", "getReviewById", error as Error);
    }
  }

  async respondToReview(reviewId: string, sellerId: string, data: RespondToReviewRequest): Promise<ReviewData> {
    try {
      // First check if review exists and belongs to seller
      const review = await this.getReviewById(reviewId, sellerId);
      if (!review) {
        throw new ReviewNotFoundError(reviewId);
      }

      if (review.response) {
        throw new ReviewAlreadyRespondedError();
      }

      const updatedReview = await Review.findByIdAndUpdate(
        reviewId,
        {
          response: data.response,
          responseDate: new Date()
        },
        { new: true }
      )
        .populate('userId', 'name email')
        .populate('productId', 'name images')
        .lean();

      return updatedReview as unknown as ReviewData;
    } catch (error) {
      if (error instanceof ReviewNotFoundError || error instanceof ReviewAlreadyRespondedError) {
        throw error;
      }
      throw new RepositoryError("Failed to respond to review", "respondToReview", error as Error);
    }
  }

  async reportReview(reviewId: string, sellerId: string, data: ReportReviewRequest): Promise<void> {
    try {
      // First check if review exists and belongs to seller
      const review = await this.getReviewById(reviewId, sellerId);
      if (!review) {
        throw new ReviewNotFoundError(reviewId);
      }

      await Review.findByIdAndUpdate(reviewId, {
        reported: true,
        reportReason: data.reason,
        reportDescription: data.description,
        reportedAt: new Date()
      });
    } catch (error) {
      if (error instanceof ReviewNotFoundError) {
        throw error;
      }
      throw new RepositoryError("Failed to report review", "reportReview", error as Error);
    }
  }

  async exportReviews(sellerId: string, query: SellerReviewsQuery): Promise<ReviewData[]> {
    try {
      const dateFilter = this.getDateFilter(query.period);

      // Get seller's products
      const sellerProducts = await Product.find({ sellerId: new Types.ObjectId(sellerId) }).select('_id');
      const productIds = sellerProducts.map(p => p._id);

      // Build query
      const reviewQuery: any = {
        productId: { $in: productIds },
        ...dateFilter
      };

      if (query.status) {
        reviewQuery.status = query.status;
      }

      if (query.rating) {
        reviewQuery.rating = parseInt(query.rating);
      }

      if (query.productId) {
        reviewQuery.productId = new Types.ObjectId(query.productId);
      }

      if (query.search) {
        reviewQuery.$or = [
          { comment: { $regex: query.search, $options: 'i' } },
          { response: { $regex: query.search, $options: 'i' } }
        ];
      }

      const reviews = await Review.find(reviewQuery)
        .populate('userId', 'name email')
        .populate('productId', 'name images')
        .sort({ createdAt: -1 })
        .lean();

      return reviews as unknown as ReviewData[];
    } catch (error) {
      throw new RepositoryError("Failed to export reviews", "exportReviews", error as Error);
    }
  }
}