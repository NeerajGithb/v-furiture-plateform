import { z } from "zod";
import { PeriodSchema } from "@/lib/domain/shared/commonSchemas";

export const SellerEarningsQuerySchema = z.object({
  period: PeriodSchema.optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  status: z.enum(['all', 'pending', 'completed', 'failed']).default('all'),
  search: z.string().optional(),
  action: z.enum(['summary', 'transactions', 'export', 'payout', 'payouts', 'analytics']).optional(),
});

export const PayoutRequestSchema = z.object({
  amount: z.number().min(1, "Amount must be greater than 0"),
  bankDetails: z.object({
    accountNumber: z.string().min(1, "Account number is required"),
    ifscCode: z.string().min(1, "IFSC code is required"),
    accountHolderName: z.string().min(1, "Account holder name is required"),
    bankName: z.string().min(1, "Bank name is required"),
  }),
});

export const EarningsExportSchema = z.object({
  period: PeriodSchema.optional(),
  format: z.enum(['csv', 'json']).default('csv'),
});

export type SellerEarningsQueryRequest = z.infer<typeof SellerEarningsQuerySchema>;
export type PayoutRequestRequest = z.infer<typeof PayoutRequestSchema>;
export type EarningsExportRequest = z.infer<typeof EarningsExportSchema>;