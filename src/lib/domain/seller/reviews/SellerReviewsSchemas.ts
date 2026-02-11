import { z } from "zod";
import { PeriodSchema } from "../../shared/commonSchemas";

export const SellerReviewsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.string().optional(),
  rating: z.string().optional(),
  productId: z.string().optional(),
  search: z.string().optional(),
  period: PeriodSchema.default("all"),
});

export const RespondToReviewSchema = z.object({
  response: z.string().min(1, "Response is required"),
});

export const ReportReviewSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
  description: z.string().optional(),
});

export type SellerReviewsQuery = z.infer<typeof SellerReviewsQuerySchema>;
export type RespondToReviewRequest = z.infer<typeof RespondToReviewSchema>;
export type ReportReviewRequest = z.infer<typeof ReportReviewSchema>;