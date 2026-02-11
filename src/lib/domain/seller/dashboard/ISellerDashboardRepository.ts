export interface SellerProductStats {
  total: number;
  published: number;
  draft: number;
  pending: number;
  approved: number;
  rejected: number;
  lowStock: number;
  outOfStock: number;
  totalViews: number;
  totalSold: number;
  totalWishlisted: number;
}

export interface SellerOrderStats {
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  returned: number;
}

export interface SellerRevenueStats {
  total: number;
  completed: number;
  pending: number;
  growth: number;
}

export interface SellerEarningsStats {
  totalRevenue: number;
  completedRevenue: number;
  pendingRevenue: number;
  totalPayouts: number;
  pendingPayouts: number;
  platformFees: number;
  growth: number;
}

export interface SellerReviewStats {
  total: number;
  avgRating: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface SellerAnalyticsStats {
  totalCustomers: number;
  repeatCustomers: number;
  conversionRate: number;
  avgOrderValue: number;
}

export interface SellerRecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface SellerRecentActivity {
  orders: SellerRecentOrder[];
  reviews: any[];
  products: any[];
}

export interface SellerDashboardStats {
  products: SellerProductStats;
  orders: SellerOrderStats;
  revenue: SellerRevenueStats;
  earnings: SellerEarningsStats;
  reviews: SellerReviewStats;
  analytics: SellerAnalyticsStats;
  recentOrders: SellerRecentOrder[];
  recentActivity: SellerRecentActivity;
}

export interface SellerDashboardData {
  products: SellerProductStats;
  orders: SellerOrderStats;
  revenue: SellerRevenueStats;
  earnings?: SellerEarningsStats;
  reviews?: SellerReviewStats;
  analytics?: SellerAnalyticsStats;
  recentOrders: SellerRecentOrder[];
  recentActivity?: SellerRecentActivity;
}

export interface ISellerDashboardRepository {
  getDashboardStats(sellerId: string, period?: string): Promise<SellerDashboardData>;
}
