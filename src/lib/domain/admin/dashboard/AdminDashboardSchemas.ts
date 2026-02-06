import { z } from "zod";

export const AdminDashboardQuerySchema = z.object({
  period: z.enum(['1h', '24h', '7d', '30d', '90d', '1y', 'all']).default('30d'),
  section: z.enum(['overview', 'sales', 'users', 'products', 'sellers', 'orders']).optional(),
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
  settings: z.record(z.any()).optional(),
});

export const DashboardLayoutSchema = z.object({
  widgets: z.array(DashboardWidgetSchema),
  layout: z.enum(['grid', 'list']).default('grid'),
});

export type AdminDashboardQueryRequest = z.infer<typeof AdminDashboardQuerySchema>;
export type DashboardWidgetRequest = z.infer<typeof DashboardWidgetSchema>;
export type DashboardLayoutRequest = z.infer<typeof DashboardLayoutSchema>;