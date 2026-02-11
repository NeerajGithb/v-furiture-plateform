import { z } from "zod";
import { PeriodSchema } from "../../shared/commonSchemas";

export const UserStatusSchema = z.enum(["active", "inactive", "suspended", "banned"]);
export type UserStatus = z.infer<typeof UserStatusSchema>;

export const AdminUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: UserStatusSchema.optional(),
  emailVerified: z.coerce.boolean().optional(),
  period: PeriodSchema.optional(),
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

// User stats schema
export const UserStatsQuerySchema = z.object({
  period: PeriodSchema.default("30d"),
});

// Type exports
export type AdminUsersQueryRequest = z.infer<typeof AdminUsersQuerySchema>;
export type UserStatusUpdateRequest = z.infer<typeof UserStatusUpdateSchema>;
export type UserStatsQueryRequest = z.infer<typeof UserStatsQuerySchema>;