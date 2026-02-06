import { z } from "zod";

export const AdminAnalyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y', 'custom']).default('30d'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupBy: z.enum(['day', 'week', 'month']).default('day'),
  metrics: z.array(z.enum(['revenue', 'orders', 'users', 'products', 'sellers'])).optional(),
});

export const AnalyticsExportSchema = z.object({
  format: z.enum(['csv', 'json', 'pdf']).default('csv'),
  period: z.enum(['7d', '30d', '90d', '1y', 'custom']).default('30d'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  metrics: z.array(z.enum(['revenue', 'orders', 'users', 'products', 'sellers'])).default(['revenue', 'orders']),
});

export type AdminAnalyticsQueryRequest = z.infer<typeof AdminAnalyticsQuerySchema>;
export type AnalyticsExportRequest = z.infer<typeof AnalyticsExportSchema>;