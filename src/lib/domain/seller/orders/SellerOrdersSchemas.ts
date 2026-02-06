import { z } from "zod";

export const SellerOrdersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']).optional(),
  period: z.enum(['30min', '1hour', '1day', '7days', '30days', '1year', 'all']).default('all'),
  sortBy: z.enum(['createdAt', 'updatedAt', 'totalAmount', 'orderStatus']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  action: z.enum(['list', 'stats', 'export', 'bulk-update']).optional(),
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
  carrier: z.string().min(1, "Carrier is required"),
});

export const OrderNotesSchema = z.object({
  notes: z.string().min(1, "Notes cannot be empty"),
});

export const OrderCancelSchema = z.object({
  reason: z.string().min(1, "Cancellation reason is required"),
});

export type SellerOrdersQueryRequest = z.infer<typeof SellerOrdersQuerySchema>;
export type OrderStatusUpdateRequest = z.infer<typeof OrderStatusUpdateSchema>;
export type BulkOrderUpdateRequest = z.infer<typeof BulkOrderUpdateSchema>;
export type OrderExportRequest = z.infer<typeof OrderExportSchema>;
export type OrderTrackingUpdateRequest = z.infer<typeof OrderTrackingUpdateSchema>;
export type OrderNotesRequest = z.infer<typeof OrderNotesSchema>;
export type OrderCancelRequest = z.infer<typeof OrderCancelSchema>;