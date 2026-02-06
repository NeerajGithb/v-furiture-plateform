import { z } from "zod";

export const CouponTypeSchema = z.enum(["percentage", "fixed"]);

export const AdminCouponsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  type: CouponTypeSchema.optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(["createdAt", "code", "discount", "expiryDate"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const CouponCreateSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters"),
  type: CouponTypeSchema,
  discount: z.number().min(0),
  minOrderAmount: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  usageLimit: z.number().min(1).optional(),
  expiryDate: z.string().datetime(),
  isActive: z.boolean().default(true),
});

export const CouponUpdateSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").optional(),
  type: CouponTypeSchema.optional(),
  discount: z.number().min(0).optional(),
  minOrderAmount: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  usageLimit: z.number().min(1).optional(),
  expiryDate: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

export type AdminCouponsQueryRequest = z.infer<typeof AdminCouponsQuerySchema>;
export type CouponCreateRequest = z.infer<typeof CouponCreateSchema>;
export type CouponUpdateRequest = z.infer<typeof CouponUpdateSchema>;