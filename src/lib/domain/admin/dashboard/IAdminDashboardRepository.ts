import { AdminDashboardQueryRequest, DashboardLayoutRequest } from "./AdminDashboardSchemas";

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
  salesTrend: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  topSellingProducts: Array<{
    id: string;
    name: string;
    revenue: number;
    quantity: number;
  }>;
}

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userGrowth: number;
  usersByLocation: Array<{
    location: string;
    count: number;
    percentage: number;
  }>;
  userActivity: Array<{
    date: string;
    activeUsers: number;
    newUsers: number;
  }>;
}

export interface ProductMetrics {
  totalProducts: number;
  publishedProducts: number;
  pendingProducts: number;
  outOfStockProducts: number;
  productsByCategory: Array<{
    categoryId: string;
    categoryName: string;
    count: number;
    percentage: number;
  }>;
  recentProducts: Array<{
    id: string;
    name: string;
    status: string;
    createdAt: Date;
  }>;
}

export interface SellerMetrics {
  totalSellers: number;
  activeSellers: number;
  pendingSellers: number;
  verifiedSellers: number;
  topSellers: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
    rating: number;
  }>;
  sellerGrowth: Array<{
    date: string;
    newSellers: number;
    activeSellers: number;
  }>;
}

export interface OrderMetrics {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  ordersByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    amount: number;
    status: string;
    createdAt: Date;
  }>;
}

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  data: any;
  lastUpdated: Date;
}

export interface DashboardLayout {
  widgets: Array<{
    widgetId: string;
    position: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    settings?: Record<string, any>;
  }>;
  layout: 'grid' | 'list';
  lastModified: Date;
}

export interface IAdminDashboardRepository {
  // Overview data
  getDashboardOverview(query: AdminDashboardQueryRequest): Promise<DashboardOverview>;
  
  // Section-specific metrics
  getSalesMetrics(query: AdminDashboardQueryRequest): Promise<SalesMetrics>;
  getUserMetrics(query: AdminDashboardQueryRequest): Promise<UserMetrics>;
  getProductMetrics(query: AdminDashboardQueryRequest): Promise<ProductMetrics>;
  getSellerMetrics(query: AdminDashboardQueryRequest): Promise<SellerMetrics>;
  getOrderMetrics(query: AdminDashboardQueryRequest): Promise<OrderMetrics>;
  
  // Widget management
  getWidget(widgetId: string): Promise<DashboardWidget | null>;
  updateWidget(widgetId: string, data: any): Promise<DashboardWidget>;
  
  // Layout management
  getDashboardLayout(adminId: string): Promise<DashboardLayout | null>;
  updateDashboardLayout(adminId: string, layout: DashboardLayoutRequest): Promise<DashboardLayout>;
  
  // Real-time data
  getRealTimeMetrics(): Promise<{
    activeUsers: number;
    ongoingOrders: number;
    todayRevenue: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
  }>;
}