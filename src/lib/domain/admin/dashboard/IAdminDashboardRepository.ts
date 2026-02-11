import { AdminDashboardQueryRequest, EntityScope } from "./AdminDashboardSchemas";

export interface DashboardOverview {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  totalSellers: number;
  revenueGrowth: number;
  ordersGrowth: number;
  usersGrowth: number;
  avgOrderValue: number;
  conversionRate: number;
}

export interface SalesMetrics {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
}

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  userGrowth: number;
}

export interface ProductMetrics {
  totalProducts: number;
  publishedProducts: number;
  pendingProducts: number;
  draftProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  totalCategories: number;
}

export interface SellerMetrics {
  totalSellers: number;
  activeSellers: number;
  pendingSellers: number;
  suspendedSellers: number;
  verifiedSellers: number;
  inactiveSellers: number;
}

export interface OrderMetrics {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
}

export interface PaymentMetrics {
  totalPayments: number;
  paidOrders: number;
  pendingPayments: number;
  failedPayments: number;
  refundedPayments: number;
}

export interface ReviewMetrics {
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  averageRating: number;
}

export interface IAdminDashboardRepository {
  // Overview data
  getDashboardOverview(scope?: EntityScope): Promise<DashboardOverview>;
  
  // Section-specific metrics (counts only) - each with its own scope
  getSalesMetrics(scope?: EntityScope): Promise<SalesMetrics>;
  getUserMetrics(scope?: EntityScope): Promise<UserMetrics>;
  getProductMetrics(scope?: EntityScope): Promise<ProductMetrics>;
  getSellerMetrics(scope?: EntityScope): Promise<SellerMetrics>;
  getOrderMetrics(scope?: EntityScope): Promise<OrderMetrics>;
  getPaymentMetrics(scope?: EntityScope): Promise<PaymentMetrics>;
  getReviewMetrics(scope?: EntityScope): Promise<ReviewMetrics>;
  
  // Real-time data
  getRealTimeMetrics(): Promise<{
    activeUsers: number;
    ongoingOrders: number;
    todayRevenue: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
  }>;
}