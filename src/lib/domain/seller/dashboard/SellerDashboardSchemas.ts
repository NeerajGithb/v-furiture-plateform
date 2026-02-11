import { z } from "zod";
import { PeriodSchema } from "../../shared/commonSchemas";

export const SellerDashboardQuerySchema = z.object({
  period: PeriodSchema.optional(),
});

export type SellerDashboardQueryRequest = z.infer<typeof SellerDashboardQuerySchema>;