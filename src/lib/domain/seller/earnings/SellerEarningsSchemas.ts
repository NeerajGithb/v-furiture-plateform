import { z } from "zod";

export const SellerEarningsQuerySchema = z.object({
  period: z.enum(['7days', '30days', '90days', '1year', 'all']).default('30days'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  status: z.enum(['all', 'pending', 'completed', 'failed']).default('all'),
  search: z.string().optional(),
  action: z.enum(['summary', 'transactions', 'export', 'payout', 'payouts']).optional(),
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
  period: z.enum(['7days', '30days', '90days', '1year']).default('30days'),
  format: z.enum(['csv', 'json']).default('csv'),
});

export type SellerEarningsQueryRequest = z.infer<typeof SellerEarningsQuerySchema>;
export type PayoutRequestRequest = z.infer<typeof PayoutRequestSchema>;
export type EarningsExportRequest = z.infer<typeof EarningsExportSchema>;