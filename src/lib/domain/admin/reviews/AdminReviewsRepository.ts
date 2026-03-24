import { IAdminReviewsRepository, AdminReview, ReviewStats } from "./IAdminReviewsRepository";
import { PaginationResult } from "../../shared/types";
import { getStartDateFromPeriod } from "../../shared/dateUtils";
import Review from "@/models/Review";

export class AdminReviewsRepository implements IAdminReviewsRepository {
  async findMany(query: any): Promise<PaginationResult<AdminReview>> {
      const filter: any = {};

      if (query.search) {
        filter.$or = [
          { comment: { $regex: query.search, $options: "i" } },
          { title: { $regex: query.search, $options: "i" } },
        ];
      }
      if (query.status) filter.status = query.status;
      if (query.rating) filter.rating = query.rating;

      // Period filter
      if (query.period) {
        const startDate = getStartDateFromPeriod(query.period);
        filter.createdAt = { $gte: startDate };
      }

      const sort: any = {};
      sort[query.sortBy] = query.sortOrder === "asc" ? 1 : -1;

      const [reviews, total] = await Promise.all([
        Review.find(filter)
          .populate("userId", "name email photoURL")
          .populate({
            path: "productId",
            select: "name mainImage sellerId",
            populate: {
              path: "sellerId",
              select: "businessName",
            },
          })
          .sort(sort)
          .skip((query.page - 1) * query.limit)
          .limit(query.limit)
          .lean(),
        Review.countDocuments(filter),
      ]);

      const mappedReviews: AdminReview[] = reviews.map((review: any) => ({
        id: review._id.toString(),
        userId: review.userId?._id?.toString() || review.userId?.toString() || review.userId,
        productId: review.productId?._id?.toString() || review.productId?.toString() || review.productId,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        status: review.status,
        rejectionReason: review.rejectionReason,
        verifiedPurchase: review.isVerifiedPurchase || false,
        helpfulVotes: review.helpfulVotes || 0,
        reports: review.reports || [],
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        user: review.userId && typeof review.userId === 'object' ? {
          name: review.userId.name,
          email: review.userId.email,
          photoURL: review.userId.photoURL,
        } : undefined,
        product: review.productId && typeof review.productId === 'object' ? {
          name: review.productId.name,
          mainImage: review.productId.mainImage,
          sellerId: review.productId.sellerId && typeof review.productId.sellerId === 'object' ? {
            businessName: review.productId.sellerId.businessName,
          } : undefined,
        } : undefined,
      }));

      return {
        data: mappedReviews,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
          hasNext: query.page < Math.ceil(total / query.limit),
          hasPrev: query.page > 1,
        },
      };
  }

  async findById(id: string): Promise<AdminReview | null> {
      const review = await Review.findById(id)
        .populate('userId', 'name email photoURL')
        .populate({
          path: 'productId',
          select: 'name mainImage sellerId',
          populate: {
            path: 'sellerId',
            select: 'businessName',
          },
        })
        .lean();

      if (!review) return null;

      const reviewDoc = review as any;

      return {
        id: reviewDoc._id.toString(),
        userId: reviewDoc.userId?._id?.toString() || reviewDoc.userId?.toString() || reviewDoc.userId,
        productId: reviewDoc.productId?._id?.toString() || reviewDoc.productId?.toString() || reviewDoc.productId,
        rating: reviewDoc.rating,
        title: reviewDoc.title,
        comment: reviewDoc.comment,
        status: reviewDoc.status,
        rejectionReason: reviewDoc.rejectionReason,
        verifiedPurchase: reviewDoc.isVerifiedPurchase || false,
        helpfulVotes: reviewDoc.helpfulVotes || 0,
        reports: reviewDoc.reports || [],
        createdAt: reviewDoc.createdAt,
        updatedAt: reviewDoc.updatedAt,
        user: reviewDoc.userId && typeof reviewDoc.userId === 'object' ? {
          name: reviewDoc.userId.name,
          email: reviewDoc.userId.email,
          photoURL: reviewDoc.userId.photoURL,
        } : undefined,
        product: reviewDoc.productId && typeof reviewDoc.productId === 'object' ? {
          name: reviewDoc.productId.name,
          mainImage: reviewDoc.productId.mainImage,
          sellerId: reviewDoc.productId.sellerId && typeof reviewDoc.productId.sellerId === 'object' ? {
            businessName: reviewDoc.productId.sellerId.businessName,
          } : undefined,
        } : undefined,
      };
  }

  async updateStatus(id: string, status: string, reason?: string): Promise<AdminReview> {
      const updateData: any = { status };
      if (status === 'rejected' && reason) {
        updateData.rejectionReason = reason;
      }

      const review = await Review.findByIdAndUpdate(id, updateData, { new: true })
        .populate('userId', 'name email photoURL')
        .populate({
          path: 'productId',
          select: 'name mainImage sellerId',
          populate: {
            path: 'sellerId',
            select: 'businessName',
          },
        })
        .lean();

      if (!review) {
        throw new Error(`Review not found: ${id}`);
      }

      const reviewDoc = review as any;

      return {
        id: reviewDoc._id.toString(),
        userId: reviewDoc.userId?._id?.toString() || reviewDoc.userId?.toString() || reviewDoc.userId,
        productId: reviewDoc.productId?._id?.toString() || reviewDoc.productId?.toString() || reviewDoc.productId,
        rating: reviewDoc.rating,
        title: reviewDoc.title,
        comment: reviewDoc.comment,
        status: reviewDoc.status,
        rejectionReason: reviewDoc.rejectionReason,
        verifiedPurchase: reviewDoc.isVerifiedPurchase || false,
        helpfulVotes: reviewDoc.helpfulVotes || 0,
        reports: reviewDoc.reports || [],
        createdAt: reviewDoc.createdAt,
        updatedAt: reviewDoc.updatedAt,
        user: reviewDoc.userId && typeof reviewDoc.userId === 'object' ? {
          name: reviewDoc.userId.name,
          email: reviewDoc.userId.email,
          photoURL: reviewDoc.userId.photoURL,
        } : undefined,
        product: reviewDoc.productId && typeof reviewDoc.productId === 'object' ? {
          name: reviewDoc.productId.name,
          mainImage: reviewDoc.productId.mainImage,
          sellerId: reviewDoc.productId.sellerId && typeof reviewDoc.productId.sellerId === 'object' ? {
            businessName: reviewDoc.productId.sellerId.businessName,
          } : undefined,
        } : undefined,
      };
  }

  async delete(id: string): Promise<void> {
      const result = await Review.findByIdAndDelete(id);
      if (!result) {
        throw new Error(`Review not found: ${id}`);
      }
  }

  async getStats(period?: string): Promise<ReviewStats> {
      const timeFilter: any = {};
      if (period) {
        const startDate = getStartDateFromPeriod(period);
        timeFilter.createdAt = { $gte: startDate };
      }

      const stats = await Review.aggregate([
        { $match: timeFilter },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            avgRating: { $avg: '$rating' },
            r5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
            r4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
            r3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
            r2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
            r1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
            reported: { $sum: { $cond: [{ $gt: [{ $size: { $ifNull: ['$reports', []] } }, 0] }, 1, 0] } },
          }
        }
      ]);

      const s = stats[0] || { totalReviews: 0, avgRating: 0, r5: 0, r4: 0, r3: 0, r2: 0, r1: 0, pending: 0, approved: 0, rejected: 0, reported: 0 };

      return {
        totalReviews: s.totalReviews,
        averageRating: Math.round((s.avgRating || 0) * 10) / 10,
        breakdown: { 5: s.r5, 4: s.r4, 3: s.r3, 2: s.r2, 1: s.r1 },
        pendingReviews: s.pending,
        approvedReviews: s.approved,
        rejectedReviews: s.rejected,
        reportedReviews: s.reported,
      };
  }

  async exportReviews(query: any): Promise<AdminReview[]> {
      const filter: any = {};

      if (query.search) {
        filter.$or = [
          { comment: { $regex: query.search, $options: "i" } },
          { title: { $regex: query.search, $options: "i" } },
        ];
      }
      if (query.status) filter.status = query.status;
      if (query.rating) filter.rating = query.rating;

      // Period filter
      if (query.period) {
        const startDate = getStartDateFromPeriod(query.period);
        filter.createdAt = { $gte: startDate };
      }

      const reviews = await Review.find(filter)
        .populate('userId', 'name email')
        .populate({
          path: 'productId',
          select: 'name sellerId',
          populate: {
            path: 'sellerId',
            select: 'businessName',
          },
        })
        .sort({ createdAt: -1 })
        .lean();

      return reviews.map((review: any) => ({
        id: review._id.toString(),
        userId: review.userId?._id?.toString() || review.userId?.toString() || review.userId,
        productId: review.productId?._id?.toString() || review.productId?.toString() || review.productId,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        status: review.status,
        rejectionReason: review.rejectionReason,
        verifiedPurchase: review.isVerifiedPurchase || false,
        helpfulVotes: review.helpfulVotes || 0,
        reports: review.reports || [],
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        user: review.userId && typeof review.userId === 'object' ? {
          name: review.userId.name,
          email: review.userId.email,
        } : undefined,
        product: review.productId && typeof review.productId === 'object' ? {
          name: review.productId.name,
          sellerId: review.productId.sellerId && typeof review.productId.sellerId === 'object' ? {
            businessName: review.productId.sellerId.businessName,
          } : undefined,
        } : undefined,
      }));
  }

}
