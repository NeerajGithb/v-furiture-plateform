import { z } from "zod";
import { PeriodSchema, SortOrderSchema } from "../../shared/commonSchemas";

export const FinanceQuerySchema = z.object({
  period: PeriodSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupBy: z.enum(["day", "week", "month"]).default("day"),
});

export const PayoutQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sellerId: z.string().optional(),
  status: z.enum(["pending", "processing", "completed", "failed"]).optional(),
  sortBy: z.enum(["createdAt", "amount", "status"]).default("createdAt"),
  sortOrder: SortOrderSchema.default("desc"),
});

export const PayoutCreateSchema = z.object({
  sellerId: z.string().min(1, "Seller ID is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  bankDetails: z.object({
    accountNumber: z.string().min(1, "Account number is required"),
    ifscCode: z.string().min(1, "IFSC code is required"),
    accountHolderName: z.string().min(1, "Account holder name is required"),
  }),
});

export const PayoutUpdateSchema = z.object({
  status: z.enum(["pending", "processing", "completed", "failed"]),
  notes: z.string().optional(),
});

export type FinanceQueryRequest = z.infer<typeof FinanceQuerySchema>;
export type PayoutQueryRequest = z.infer<typeof PayoutQuerySchema>;
export type PayoutCreateRequest = z.infer<typeof PayoutCreateSchema>;
export type PayoutUpdateRequest = z.infer<typeof PayoutUpdateSchema>;