import { z } from "zod";

export const AdminReviewsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  sortBy: z.enum(["createdAt", "rating", "helpfulVotes"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const ReviewStatusUpdateSchema = z.object({
  reviewId: z.string().min(1, "Review ID is required"),
  status: z.enum(["approved", "rejected"]),
  reason: z.string().optional(),
});

export const ReviewStatsQuerySchema = z.object({
  period: z.enum(["7days", "30days", "90days", "1year", "all"]).default("30days"),
});

export const ReviewExportSchema = z.object({
  format: z.enum(["csv", "json"]).default("csv"),
  search: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
});

export type AdminReviewsQueryRequest = z.infer<typeof AdminReviewsQuerySchema>;
export type ReviewStatusUpdateRequest = z.infer<typeof ReviewStatusUpdateSchema>;
export type ReviewStatsQueryRequest = z.infer<typeof ReviewStatsQuerySchema>;
export type ReviewExportRequest = z.infer<typeof ReviewExportSchema>;