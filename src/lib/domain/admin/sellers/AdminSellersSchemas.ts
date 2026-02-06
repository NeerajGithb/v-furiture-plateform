import { z } from "zod";

export const SellerStatusSchema = z.enum(["active", "pending", "suspended", "inactive"]);
export type SellerStatus = z.infer<typeof SellerStatusSchema>;

export const AdminSellersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: SellerStatusSchema.optional(),
  verified: z.coerce.boolean().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "businessName", "revenue"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const SellerStatusUpdateSchema = z.object({
  sellerId: z.string().min(1, "Seller ID is required"),
  status: SellerStatusSchema,
  reason: z.string().optional(),
});

export const SellerVerificationUpdateSchema = z.object({
  sellerId: z.string().min(1, "Seller ID is required"),
  verified: z.boolean(),
});

export type AdminSellersQueryRequest = z.infer<typeof AdminSellersQuerySchema>;
export type SellerStatusUpdateRequest = z.infer<typeof SellerStatusUpdateSchema>;
export type SellerVerificationUpdateRequest = z.infer<typeof SellerVerificationUpdateSchema>;