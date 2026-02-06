// Admin Dashboard Types
export interface AdminDashboardStats {
  period?: string;
  sellers: SellerStats;
  products: ProductStats;
  orders: OrderStats;
  revenue: RevenueStats;
  users: UserStats;
  engagement: EngagementStats;
  reviews: ReviewStats;
  categories: CategoryStats;
  search: SearchStats;
  paymentMethods: Record<string, number>;
  growth: GrowthStats;
  topProducts: TopProductsStats;
  recentActivity: RecentActivityStats;
}

export interface SellerStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  verified?: number;
}

export interface ProductStats {
  total: number;
  published: number;
  draft: number;
  lowStock: number;
  outOfStock: number;
}

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export interface RevenueStats {
  total: number;
  completed: number;
  pending: number;
  avgOrderValue: number;
  growth: number;
}

export interface UserStats {
  total: number;
  verified: number;
  unverified: number;
  uniqueCustomers: number;
}

export interface EngagementStats {
  totalAddedToCart: number;
  totalAddedToWishlist: number;
  cartAbandonmentRate: number;
  conversionRate: number;
}

export interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface CategoryStats {
  total: number;
}

export interface SearchStats {
  totalSearches: number;
  uniqueQueries: number;
  topSearches: Array<{ query: string; count: number }>;
}

export interface GrowthStats {
  revenue: number;
  orders: number;
  users: number;
}

export interface TopProductsStats {
  mostViewed: TopProduct[];
  bestSellers: TopProduct[];
  mostWishlisted: TopProduct[];
}

export interface TopProduct {
  id: string;
  name: string;
  viewCount?: number;
  totalSold?: number;
  wishlistCount?: number;
  price: number;
  image?: string;
}

export interface RecentActivityStats {
  sellers: RecentSeller[];
  orders: RecentOrder[];
  users: RecentUser[];
}

export interface RecentSeller {
  id: string;
  businessName: string;
  email: string;
  status: string;
  createdAt: Date;
}

export interface RecentOrder {
  id: string;
  orderId: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
}

export interface RecentUser {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  createdAt: Date;
}

// API Response Types
export interface AdminDashboardResponse {
  success: boolean;
  data?: AdminDashboardStats;
  error?: string;
  message?: string;
}

// Dashboard API Raw Response Types (from backend)
export interface TopSellingProduct {
  id: string;
  name: string;
  revenue: number;
  quantity: number;
}

export interface UserActivity {
  date: string;
  activeUsers: number;
  newUsers: number;
}

export interface TopSeller {
  id: string;
  name: string;
  revenue: number;
  orders: number;
  rating: number;
}

export interface RecentOrderRaw {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface SalesMetrics {
  topSellingProducts: TopSellingProduct[];
}

export interface UsersMetrics {
  activeUsers: number;
  newUsers: number;
  userActivity: UserActivity[];
}

export interface ProductsMetrics {
  publishedProducts: number;
  pendingProducts: number;
  outOfStockProducts: number;
}

export interface SellersMetrics {
  activeSellers: number;
  pendingSellers: number;
  verifiedSellers: number;
  topSellers: TopSeller[];
}

export interface OrdersMetrics {
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  recentOrders: RecentOrderRaw[];
}

export interface DashboardApiResponse {
  overview: {
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
  };
  sales: SalesMetrics;
  users: UsersMetrics;
  products: ProductsMetrics;
  sellers: SellersMetrics;
  orders: OrdersMetrics;
  period: string;
  lastUpdated: string;
}

// Component Props Types
export interface MainStatsCardsProps {
  revenue: RevenueStats;
  orders: OrderStats;
  users: UserStats;
  products: ProductStats;
  growth: GrowthStats;
}

export interface SecondaryStatsProps {
  users: UserStats;
  engagement: EngagementStats;
  search: SearchStats;
  reviews: ReviewStats;
}

export interface TopProductsProps {
  mostViewed: TopProduct[];
  bestSellers: TopProduct[];
  mostWishlisted: TopProduct[];
}

export interface SearchAndPaymentProps {
  search: SearchStats;
  paymentMethods: Record<string, number>;
}

export interface InventoryAndEngagementProps {
  products: ProductStats;
  users: UserStats;
  engagement: EngagementStats;
}

export interface RecentActivityProps {
  users: RecentUser[];
  sellers: RecentSeller[];
  orders: RecentOrder[];
}

export interface OrderStatusBreakdownProps {
  orders: OrderStats;
}