import { z } from "zod";
import { PeriodSchema, SortOrderSchema } from "../../shared/commonSchemas";

export const SellerInventoryQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['in_stock', 'low_stock', 'out_of_stock', 'active', 'resolved', 'all']).optional(),
  period: PeriodSchema.optional(),
  sortBy: z.enum(['updatedAt', 'createdAt', 'name', 'inStockQuantity']).default('updatedAt'),
  sortOrder: SortOrderSchema.default('desc'),
  action: z.enum(['export', 'get_item', 'stock_history', 'low_stock_alerts']).optional(),
  productId: z.string().optional(),
  alertId: z.string().optional(),
});

export const InventoryStatsQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['in_stock', 'low_stock', 'out_of_stock']).optional(),
  period: PeriodSchema.optional(),
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
  period: PeriodSchema.default('all'),
});

export const StockUpdateSchema = z.object({
  stock: z.number().min(0, "Stock must be non-negative").optional(),
  reorderLevel: z.number().min(0, "Reorder level must be non-negative").optional(),
});

export type SellerInventoryQueryRequest = z.infer<typeof SellerInventoryQuerySchema>;
export type InventoryStatsQueryRequest = z.infer<typeof InventoryStatsQuerySchema>;
export type BulkUpdateInventoryRequest = z.infer<typeof BulkUpdateInventorySchema>;
export type InventoryExportRequest = z.infer<typeof InventoryExportSchema>;
export type StockUpdateRequest = z.infer<typeof StockUpdateSchema>;