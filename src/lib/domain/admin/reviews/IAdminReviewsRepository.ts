import { PaginationResult } from "../../shared/types";

export interface AdminReview {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  verifiedPurchase: boolean;
  helpfulVotes: number;
  reports: any[];
  createdAt: Date;
  updatedAt: Date;
  user?: {
    name: string;
    email: string;
    photoURL?: string;
  };
  product?: {
    name: string;
    mainImage?: string;
    sellerId?: {
      businessName: string;
    };
  };
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  reportedReviews: number;
}

export interface IAdminReviewsRepository {
  findMany(query: any): Promise<PaginationResult<AdminReview>>;
  findById(id: string): Promise<AdminReview | null>;
  updateStatus(id: string, status: string, reason?: string): Promise<AdminReview>;
  delete(id: string): Promise<void>;
  getStats(period?: string): Promise<ReviewStats>;
  exportReviews(query: any): Promise<AdminReview[]>;
}