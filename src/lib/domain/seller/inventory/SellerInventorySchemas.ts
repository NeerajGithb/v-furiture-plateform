import { z } from "zod";

export const SellerInventoryQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['in_stock', 'low_stock', 'out_of_stock']).optional(),
  period: z.enum(['30min', '1hour', '1day', '7days', '30days', '1year', 'all']).default('all'),
  sortBy: z.enum(['updatedAt', 'createdAt', 'name', 'inStockQuantity']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  action: z.enum(['list', 'stats', 'export', 'bulk-update']).optional(),
});

export const BulkUpdateInventorySchema = z.object({
  updates: z.array(z.object({
    productId: z.string().min(1, "Product ID is required"),
    stock: z.number().min(0, "Stock must be non-negative").optional(),
    reorderLevel: z.number().min(0, "Reorder level must be non-negative").optional(),
  })).min(1, "At least one update is required"),
});

export const InventoryExportSchema = z.object({
  format: z.enum(['csv', 'json']).default('csv'),
  search: z.string().optional(),
  status: z.enum(['in_stock', 'low_stock', 'out_of_stock']).optional(),
  period: z.enum(['30min', '1hour', '1day', '7days', '30days', '1year', 'all']).default('all'),
});

export const StockUpdateSchema = z.object({
  stock: z.number().min(0, "Stock must be non-negative").optional(),
  reorderLevel: z.number().min(0, "Reorder level must be non-negative").optional(),
});

export type SellerInventoryQueryRequest = z.infer<typeof SellerInventoryQuerySchema>;
export type BulkUpdateInventoryRequest = z.infer<typeof BulkUpdateInventorySchema>;
export type InventoryExportRequest = z.infer<typeof InventoryExportSchema>;
export type StockUpdateRequest = z.infer<typeof StockUpdateSchema>;