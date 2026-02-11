// Re-export types from backend domain layer for frontend use
export type {
  DashboardOverview,
  SalesMetrics,
  UserMetrics,
  ProductMetrics,
  SellerMetrics,
  OrderMetrics,
  PaymentMetrics,
  ReviewMetrics,
} from '@/lib/domain/admin/dashboard/IAdminDashboardRepository';

import type {
  DashboardOverview,
  SalesMetrics,
  UserMetrics,
  ProductMetrics,
  SellerMetrics,
  OrderMetrics,
  PaymentMetrics,
  ReviewMetrics,
} from '@/lib/domain/admin/dashboard/IAdminDashboardRepository';

// Real-time metrics type
export interface RealTimeMetrics {
  activeUsers: number;
  ongoingOrders: number;
  todayRevenue: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

// Complete dashboard stats response
export interface AdminDashboardStats {
  period?: string;
  overview: DashboardOverview;
  sales: SalesMetrics;
  users: UserMetrics;
  products: ProductMetrics;
  sellers: SellerMetrics;
  orders: OrderMetrics;
  payments: PaymentMetrics;
  reviews: ReviewMetrics;
  realTime?: RealTimeMetrics;
  lastUpdated?: string;
}
