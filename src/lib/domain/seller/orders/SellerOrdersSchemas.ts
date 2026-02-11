import { z } from "zod";
import { PeriodSchema, SortOrderSchema } from "../../shared/commonSchemas";

export const SellerOrdersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']).optional(),
  period: PeriodSchema.optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'totalAmount', 'orderStatus']).optional().default('createdAt'),
  sortOrder: SortOrderSchema.optional().default('desc'),
  action: z.enum(['export', 'bulk-update']).optional(),
});

export const OrderStatsQuerySchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']).optional(),
  period: PeriodSchema.optional(),
});

export const OrderStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const BulkOrderUpdateSchema = z.object({
  orderIds: z.array(z.string()).min(1, "At least one order ID is required"),
  updates: z.object({
    orderStatus: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']).optional(),
    trackingNumber: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const OrderExportSchema = z.object({
  format: z.enum(['csv', 'json']).default('csv'),
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'all']).default('all'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const OrderTrackingUpdateSchema = z.object({
  trackingNumber: z.string().min(1, "Tracking number is required"),
  carrier: z.string().optional(),
});

export const OrderNotesSchema = z.object({
  notes: z.string().min(1, "Notes cannot be empty"),
});

export const OrderCancelSchema = z.object({
  reason: z.string().min(1, "Cancellation reason is required"),
});

export type SellerOrdersQueryRequest = z.infer<typeof SellerOrdersQuerySchema>;
export type OrderStatsQueryRequest = z.infer<typeof OrderStatsQuerySchema>;
export type OrderStatusUpdateRequest = z.infer<typeof OrderStatusUpdateSchema>;
export type BulkOrderUpdateRequest = z.infer<typeof BulkOrderUpdateSchema>;
export type OrderExportRequest = z.infer<typeof OrderExportSchema>;
export type OrderTrackingUpdateRequest = z.infer<typeof OrderTrackingUpdateSchema>;
export type OrderNotesRequest = z.infer<typeof OrderNotesSchema>;
export type OrderCancelRequest = z.infer<typeof OrderCancelSchema>;