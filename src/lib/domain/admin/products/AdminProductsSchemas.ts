import { z } from "zod";

// Product status enum
export const ProductStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);
export type ProductStatus = z.infer<typeof ProductStatusSchema>;

// Query schemas
export const AdminProductsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: ProductStatusSchema.optional(),
  sellerId: z.string().optional(),
  categoryId: z.string().optional(),
  subCategoryId: z.string().optional(),
  isPublished: z.coerce.boolean().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "name", "price", "status"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
});

// Product update schemas
export const ProductApprovalSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  status: ProductStatusSchema,
  reason: z.string().optional(),
});

export const BulkProductApprovalSchema = z.object({
  productIds: z.array(z.string()).min(1, "At least one product ID is required"),
  status: ProductStatusSchema,
  reason: z.string().optional(),
});

export const BulkProductPublishSchema = z.object({
  productIds: z.array(z.string()).min(1, "At least one product ID is required"),
  isPublished: z.boolean(),
});

export const BulkProductDeleteSchema = z.object({
  productIds: z.array(z.string()).min(1, "At least one product ID is required"),
});

// Product stats schema
export const ProductStatsQuerySchema = z.object({
  period: z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
  groupBy: z.enum(["day", "week", "month"]).default("day"),
});

// Type exports
export type AdminProductsQueryRequest = z.infer<typeof AdminProductsQuerySchema>;
export type ProductApprovalRequest = z.infer<typeof ProductApprovalSchema>;
export type BulkProductApprovalRequest = z.infer<typeof BulkProductApprovalSchema>;
export type BulkProductPublishRequest = z.infer<typeof BulkProductPublishSchema>;
export type BulkProductDeleteRequest = z.infer<typeof BulkProductDeleteSchema>;
export type ProductStatsQueryRequest = z.infer<typeof ProductStatsQuerySchema>;