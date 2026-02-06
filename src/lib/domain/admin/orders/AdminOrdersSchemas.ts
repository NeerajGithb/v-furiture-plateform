import { z } from "zod";

// Order status enum
export const OrderStatusSchema = z.enum([
  "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

// Payment status enum
export const PaymentStatusSchema = z.enum(["pending", "paid", "failed", "refunded"]);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

// Query schemas
export const AdminOrdersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  orderStatus: OrderStatusSchema.optional(),
  paymentStatus: PaymentStatusSchema.optional(),
  sellerId: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "totalAmount", "orderNumber"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional(),
});

// Order update schemas
export const OrderStatusUpdateSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  orderStatus: OrderStatusSchema,
  notes: z.string().optional(),
});

export const OrderPaymentUpdateSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  paymentStatus: PaymentStatusSchema,
  notes: z.string().optional(),
});

// Order stats schema
export const OrderStatsQuerySchema = z.object({
  period: z.enum(["7d", "30d", "90d", "1y"]).default("30d"),
  groupBy: z.enum(["day", "week", "month"]).default("day"),
});

// Export schema
export const OrderExportSchema = z.object({
  format: z.enum(["csv", "xlsx"]).default("csv"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  orderStatus: OrderStatusSchema.optional(),
  paymentStatus: PaymentStatusSchema.optional(),
});

// Type exports
export type AdminOrdersQueryRequest = z.infer<typeof AdminOrdersQuerySchema>;
export type OrderStatusUpdateRequest = z.infer<typeof OrderStatusUpdateSchema>;
export type OrderPaymentUpdateRequest = z.infer<typeof OrderPaymentUpdateSchema>;
export type OrderStatsQueryRequest = z.infer<typeof OrderStatsQuerySchema>;
export type OrderExportRequest = z.infer<typeof OrderExportSchema>;