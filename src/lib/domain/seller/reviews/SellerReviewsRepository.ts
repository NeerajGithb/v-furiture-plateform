import { ISellerReviewsRepository, ReviewData, ReviewsResult } from "./ISellerReviewsRepository";
import { SellerReviewsQuery, RespondToReviewRequest, ReportReviewRequest } from "./SellerReviewsSchemas";
import { 
  ReviewNotFoundError, 
  ReviewAlreadyRespondedError
} from "./SellerReviewsErrors";
import { RepositoryError } from "../../shared/InfrastructureError";
import { getStartDateFromPeriod } from "@/lib/domain/shared/dateUtils";
import Review from "@/models/Review";
import Product from "@/models/Product";
import { Types } from "mongoose";

export class SellerReviewsRepository implements ISellerReviewsRepository {
  
  async getReviews(sellerId: string, query: SellerReviewsQuery): Promise<ReviewsResult> {
    const page = Math.max(query.page, 1);
    const limit = Math.min(query.limit, 50);

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

    const reviewQuery: any = {
      productId: { $in: productIds }
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

    const totalReviews = await Review.countDocuments(reviewQuery);

    const skip = (page - 1) * limit;
    const reviews = await Review.find(reviewQuery)
      .populate('userId', 'name email')
      .populate('productId', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const allReviews = await Review.find({ productId: { $in: productIds } }).lean();
    const totalCount = allReviews.length;
    const averageRating = totalCount > 0 ? allReviews.reduce((sum, review) => sum + review.rating, 0) / totalCount : 0;

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allReviews.forEach(review => {
      breakdown[review.rating as keyof typeof breakdown]++;
    });

    const reviewsWithResponse = allReviews.filter(review => review.response);
    const responseRate = totalCount > 0 ? (reviewsWithResponse.length / totalCount) * 100 : 0;

    const responseTimes = reviewsWithResponse
      .filter(review => review.responseDate)
      .map(review => {
        const reviewDate = new Date(review.createdAt);
        const responseDate = new Date(review.responseDate!);
        return (responseDate.getTime() - reviewDate.getTime()) / (1000 * 60 * 60);
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
  }

  async getReviewById(reviewId: string, sellerId: string): Promise<ReviewData | null> {
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
  }

  async respondToReview(reviewId: string, sellerId: string, data: RespondToReviewRequest): Promise<ReviewData> {
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
  }

  async reportReview(reviewId: string, sellerId: string, data: ReportReviewRequest): Promise<void> {
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
  }

  async exportReviews(sellerId: string, query: SellerReviewsQuery): Promise<ReviewData[]> {
    const sellerProducts = await Product.find({ sellerId: new Types.ObjectId(sellerId) }).select('_id');
    const productIds = sellerProducts.map(p => p._id);

    const reviewQuery: any = {
      productId: { $in: productIds }
    };

    if (query.period) {
      const startDate = getStartDateFromPeriod(query.period);
      reviewQuery.createdAt = { $gte: startDate };
    }

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
  }
}