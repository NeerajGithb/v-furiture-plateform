import { z } from "zod";

// User status enum
export const UserStatusSchema = z.enum(["active", "inactive", "suspended", "banned"]);
export type UserStatus = z.infer<typeof UserStatusSchema>;

// Query schemas
export const AdminUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: UserStatusSchema.optional(),
  emailVerified: z.coerce.boolean().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "name", "email", "lastLogin"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// User update schemas
export const UserStatusUpdateSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  status: UserStatusSchema,
  reason: z.string().optional(),
  moderatedBy: z.string().optional(),
});

// Type exports
export type AdminUsersQueryRequest = z.infer<typeof AdminUsersQuerySchema>;
export type UserStatusUpdateRequest = z.infer<typeof UserStatusUpdateSchema>;