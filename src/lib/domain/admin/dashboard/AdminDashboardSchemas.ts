import { z } from "zod";
import { PeriodSchema } from "../../shared/commonSchemas";

const EntityScopeSchema = z.object({
  period: PeriodSchema.optional(),
}).optional();

export const AdminDashboardQuerySchema = z.object({
  overview: EntityScopeSchema,
  orders: EntityScopeSchema,
  users: EntityScopeSchema,
  products: EntityScopeSchema,
  sellers: EntityScopeSchema,
  payments: EntityScopeSchema,
  reviews: EntityScopeSchema,
  sales: EntityScopeSchema,
  refresh: z.enum(['true', 'false']).default('false'),
});

export const DashboardWidgetSchema = z.object({
  widgetId: z.string().min(1, "Widget ID is required"),
  position: z.object({
    x: z.number().min(0),
    y: z.number().min(0),
    width: z.number().min(1),
    height: z.number().min(1),
  }),
  settings: z.record(z.string(), z.any()).optional(),
});

export const DashboardLayoutSchema = z.object({
  widgets: z.array(DashboardWidgetSchema),
  layout: z.enum(['grid', 'list']).default('grid'),
});

export type TimePeriod = z.infer<typeof PeriodSchema>;

export interface EntityScope {
  period?: TimePeriod;
}

export type AdminDashboardQueryRequest = z.infer<typeof AdminDashboardQuerySchema>;
export type DashboardWidgetRequest = z.infer<typeof DashboardWidgetSchema>;
export type DashboardLayoutRequest = z.infer<typeof DashboardLayoutSchema>;