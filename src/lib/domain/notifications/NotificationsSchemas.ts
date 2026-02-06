import { z } from "zod";

// Get notifications schema
export const GetNotificationsSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  includeRead: z.coerce.boolean().optional(),
  userType: z.enum(['seller', 'admin']).optional(),
});

// Create notification schema
export const CreateNotificationSchema = z
  .object({
    sellerId: z.string().optional(),
    userId: z.string().optional(),
    adminId: z.string().optional(),
    type: z.string().min(1, "Type is required"),
    subType: z.string().min(1, "SubType is required"),
    priority: z.number().min(1).max(5).default(3),
    title: z.string().min(1, "Title is required").max(200),
    message: z.string().min(1, "Message is required").max(1000),
    link: z.string().url().optional(),
    actions: z
      .array(
        z.object({
          label: z.string(),
          action: z.string(),
          style: z.enum(["primary", "secondary", "danger"]).optional(),
        }),
      )
      .optional(),
    metadata: z.record(z.string(), z.any()).optional(),
    channels: z
      .array(z.enum(["in-app", "email", "sms", "push"]))
      .default(["in-app"]),
    expiresAt: z.string().optional(),
    groupId: z.string().optional(),
  })
  .refine((data) => data.sellerId || data.userId || data.adminId, {
    message: "Either sellerId, userId, or adminId is required",
    path: ["userId"],
  });

// Update notification schema
export const UpdateNotificationSchema = z
  .object({
    id: z.string().optional(),
    markAll: z.coerce.boolean().optional(),
    dismissRead: z.coerce.boolean().optional(),
    action: z.enum(["read", "dismiss"]).default("read"),
    userType: z.enum(['seller', 'admin']).optional(),
  })
  .refine((data) => data.id || data.markAll || data.dismissRead, {
    message:
      "Either notification ID, markAll, or dismissRead parameter is required",
    path: ["id"],
  });

// Bulk notification schema for admin operations
export const BulkNotificationSchema = z.object({
  recipientType: z.enum(['all-sellers', 'all-admins', 'specific-sellers', 'specific-admins']),
  recipientIds: z.array(z.string()).optional(),
  type: z.string().min(1, "Type is required"),
  subType: z.string().min(1, "SubType is required"),
  priority: z.number().min(1).max(5).default(3),
  title: z.string().min(1, "Title is required").max(200),
  message: z.string().min(1, "Message is required").max(1000),
  link: z.string().url().optional(),
  actions: z
    .array(
      z.object({
        label: z.string(),
        action: z.string(),
        style: z.enum(["primary", "secondary", "danger"]).optional(),
      }),
    )
    .optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  channels: z
    .array(z.enum(["in-app", "email", "sms", "push"]))
    .default(["in-app"]),
  expiresAt: z.string().optional(),
  groupId: z.string().optional(),
});

// Type exports
export type GetNotificationsRequest = z.infer<typeof GetNotificationsSchema>;
export type CreateNotificationRequest = z.infer<typeof CreateNotificationSchema>;
export type UpdateNotificationRequest = z.infer<typeof UpdateNotificationSchema>;
export type BulkNotificationRequest = z.infer<typeof BulkNotificationSchema>;