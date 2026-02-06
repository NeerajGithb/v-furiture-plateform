import { z } from "zod";

export const SellerProductsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['published', 'draft', 'outOfStock', 'lowStock', 'pending', 'approved', 'rejected']).optional(),
  period: z.enum(['30min', '1hour', '1day', '7days', '30days', '1year', 'all']).default('all'),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'finalPrice', 'inStockQuantity']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  action: z.enum(['list', 'stats', 'export', 'bulk-update']).optional(),
});

export const CreateProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Product description is required"),
  categoryId: z.string().min(1, "Category is required"),
  subCategoryId: z.string().optional(),
  originalPrice: z.number().min(0, "Original price must be non-negative"),
  finalPrice: z.number().min(0, "Final price must be non-negative"),
  discountPercent: z.number().min(0).max(100).optional(),
  inStockQuantity: z.number().min(0, "Stock quantity must be non-negative"),
  mainImage: z.object({
    url: z.string().min(1),
    publicId: z.string(),
  }),
  galleryImages: z.array(z.object({
    url: z.string().min(1),
    publicId: z.string(),
  })).optional(),
  sku: z.string().optional(),
  isPublished: z.boolean().default(false),
});

export const UpdateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  categoryId: z.string().optional(),
  subCategoryId: z.string().optional(),
  originalPrice: z.number().min(0).optional(),
  finalPrice: z.number().min(0).optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  inStockQuantity: z.number().min(0).optional(),
  mainImage: z.object({
    url: z.string().min(1),
    publicId: z.string(),
  }).optional(),
  galleryImages: z.array(z.object({
    url: z.string().min(1),
    publicId: z.string(),
  })).optional(),
  isPublished: z.boolean().optional(),
});

export const BulkProductUpdateSchema = z.object({
  productIds: z.array(z.string()).min(1, "At least one product ID is required"),
  updates: z.object({
    isPublished: z.boolean().optional(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
    inStockQuantity: z.number().min(0).optional(),
    finalPrice: z.number().min(0).optional(),
  }),
});

export const ProductExportSchema = z.object({
  format: z.enum(['csv', 'json']).default('csv'),
  search: z.string().optional(),
  status: z.enum(['published', 'draft', 'outOfStock', 'lowStock', 'pending', 'approved', 'rejected', 'all']).default('all'),
});

export type SellerProductsQueryRequest = z.infer<typeof SellerProductsQuerySchema>;
export type CreateProductRequest = z.infer<typeof CreateProductSchema>;
export type UpdateProductRequest = z.infer<typeof UpdateProductSchema>;
export type BulkProductUpdateRequest = z.infer<typeof BulkProductUpdateSchema>;
export type ProductExportRequest = z.infer<typeof ProductExportSchema>;