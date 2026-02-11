import { z } from "zod";
import { PeriodSchema, SortOrderSchema } from "../../shared/commonSchemas";

export const SellerNotificationsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.enum(['order', 'customer', 'product', 'payment', 'system']).optional(),
  read: z.enum(['true', 'false']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  period: PeriodSchema.or(z.enum(['all'])).default('all'),
  sortBy: z.enum(['createdAt', 'priority', 'type']).default('createdAt'),
  sortOrder: SortOrderSchema.default('desc'),
  action: z.enum(['list', 'unread-count', 'mark-all-read', 'bulk-delete', 'clear-all']).optional(),
});

export const BulkDeleteNotificationsSchema = z.object({
  notificationIds: z.array(z.string()).min(1, "At least one notification ID is required"),
});

export const NotificationActionSchema = z.object({
  action: z.enum(['read', 'unread', 'delete']),
});

export type SellerNotificationsQueryRequest = z.infer<typeof SellerNotificationsQuerySchema>;
export type BulkDeleteNotificationsRequest = z.infer<typeof BulkDeleteNotificationsSchema>;
export type NotificationActionRequest = z.infer<typeof NotificationActionSchema>;