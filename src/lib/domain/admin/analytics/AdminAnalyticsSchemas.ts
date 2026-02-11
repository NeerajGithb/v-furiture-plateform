import { z } from "zod";
import { PeriodSchema } from "../../shared/commonSchemas";

export const AdminAnalyticsQuerySchema = z.object({
  period: PeriodSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupBy: z.enum(['day', 'week', 'month']).default('day'),
  metrics: z.array(z.enum(['revenue', 'orders', 'users', 'products', 'sellers'])).optional(),
});

export const AnalyticsExportSchema = z.object({
  format: z.enum(['csv', 'json', 'pdf']).default('csv'),
  period: PeriodSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  metrics: z.array(z.enum(['revenue', 'orders', 'users', 'products', 'sellers'])).default(['revenue', 'orders']),
});

export type AdminAnalyticsQueryRequest = z.infer<typeof AdminAnalyticsQuerySchema>;
export type AnalyticsExportRequest = z.infer<typeof AnalyticsExportSchema>;