import { TimePeriod, ApiResponse } from './common';

// Seller Dashboard Stats Types
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

// Main Dashboard Stats Interface
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
  earnings: SellerEarningsStats;
  reviews: SellerReviewStats;
  analytics: SellerAnalyticsStats;
  recentOrders: SellerRecentOrder[];
  recentActivity: SellerRecentActivity;
}

// API Response Types
export interface SellerDashboardApiResponse {
  products: {
    total: number;
    published: number;
    draft: number;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
  };
  revenue: {
    total: number;
    completed: number;
  };
  recentOrders: SellerRecentOrder[];
}

export interface SellerDashboardResponse extends ApiResponse {
  data: SellerDashboardApiResponse;
}

export interface SellerProductStatsResponse extends ApiResponse {
  data: SellerProductStats;
}

export interface SellerOrderStatsResponse extends ApiResponse {
  data: SellerOrderStats;
}

export interface SellerEarningsStatsResponse extends ApiResponse {
  data: SellerEarningsStats;
}

export interface SellerReviewStatsResponse extends ApiResponse {
  data: SellerReviewStats;
}

// Service Parameters
export interface SellerDashboardParams {
  period?: TimePeriod;
}

// UI State Types
export interface SellerDashboardUIState {
  selectedMetric: string;
  showDetailedView: boolean;
  expandedSections: string[];
  selectedTimeRange: TimePeriod;
  
  // UI Actions
  setSelectedMetric: (metric: string) => void;
  setShowDetailedView: (show: boolean) => void;
  toggleSection: (section: string) => void;
  setSelectedTimeRange: (range: TimePeriod) => void;
  reset: () => void;
}

// Component Props Types
export interface SellerDashboardOverviewProps {
  stats: SellerDashboardStats;
  isLoading?: boolean;
}

export interface SellerStatsCardsProps {
  stats: SellerDashboardStats;
  isLoading?: boolean;
}

export interface SellerOrderStatusProps {
  orderStats: SellerOrderStats;
  isLoading?: boolean;
}

export interface SellerRecentOrdersProps {
  orders: SellerRecentOrder[];
  isLoading?: boolean;
}

export interface SellerQuickActionsProps {
  stats: SellerDashboardStats;
}