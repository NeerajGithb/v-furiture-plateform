import { z } from "zod";
import { PeriodSchema, SortOrderSchema } from "../../shared/commonSchemas";

export const AdminReviewsQuerySchema = z.object({
  period: PeriodSchema.optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  sortBy: z.enum(["createdAt", "rating", "helpfulVotes"]).default("createdAt"),
  sortOrder: SortOrderSchema.default("desc"),
});

export const ReviewStatusUpdateSchema = z.object({
  reviewId: z.string().min(1, "Review ID is required"),
  status: z.enum(["approved", "rejected"]),
  reason: z.string().optional(),
});

export const ReviewStatsQuerySchema = z.object({
  period: PeriodSchema.optional(),
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