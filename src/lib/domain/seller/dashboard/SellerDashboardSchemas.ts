import { z } from "zod";

export const SellerDashboardQuerySchema = z.object({
  period: z.enum(['30min', '1hour', '1day', '7days', '30days', '1year', 'all']).default('all'),
  section: z.enum(['overview', 'earnings', 'orders', 'products', 'reviews']).optional(),
});

export type SellerDashboardQueryRequest = z.infer<typeof SellerDashboardQuerySchema>;