import { z } from "zod";

/**
 * Shared Zod schemas for common validations across the application
 */

// Time period validation - matches the Period type from dateUtils
export const PeriodSchema = z.enum(["30m", "1h", "6h", "12h", "24h", "1day", "7d", "30d", "90d", "1y", "all"]);
export type Period = z.infer<typeof PeriodSchema>;

// Group by validation for analytics
export const GroupBySchema = z.enum(["day", "week", "month"]);
export type GroupBy = z.infer<typeof GroupBySchema>;

// Pagination schemas
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

// Sort order validation
export const SortOrderSchema = z.enum(["asc", "desc"]);
export type SortOrder = z.infer<typeof SortOrderSchema>;

// Common query params for stats/analytics
export const StatsQuerySchema = z.object({
  period: PeriodSchema.default("30d"),
  groupBy: GroupBySchema.default("day"),
});

export type StatsQueryRequest = z.infer<typeof StatsQuerySchema>;
