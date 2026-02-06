import { AdminAnalyticsQueryRequest, AnalyticsExportRequest } from "./AdminAnalyticsSchemas";

export interface AnalyticsOverview {
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

export interface AnalyticsMetrics {
  date: string;
  revenue: number;
  orders: number;
  users: number;
  products: number;
  sellers: number;
  avgOrderValue: number;
}

export interface TopPerformers {
  topProducts: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
    category: string;
  }>;
  topSellers: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
    commission: number;
  }>;
  topCategories: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
    percentage: number;
  }>;
}

export interface UserAnalytics {
  newUsers: number;
  activeUsers: number;
  returningUsers: number;
  userRetentionRate: number;
  avgSessionDuration: number;
  bounceRate: number;
  usersByLocation: Array<{
    location: string;
    count: number;
    percentage: number;
  }>;
}

export interface SalesAnalytics {
  totalSales: number;
  salesGrowth: number;
  avgOrderValue: number;
  ordersByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  paymentMethods: Array<{
    method: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
}

export interface IAdminAnalyticsRepository {
  // Overview data
  getAnalyticsOverview(query: AdminAnalyticsQueryRequest): Promise<AnalyticsOverview>;
  getAnalyticsMetrics(query: AdminAnalyticsQueryRequest): Promise<AnalyticsMetrics[]>;
  
  // Performance data
  getTopPerformers(query: AdminAnalyticsQueryRequest): Promise<TopPerformers>;
  getUserAnalytics(query: AdminAnalyticsQueryRequest): Promise<UserAnalytics>;
  getSalesAnalytics(query: AdminAnalyticsQueryRequest): Promise<SalesAnalytics>;
  
  // Export data
  exportAnalytics(query: AnalyticsExportRequest): Promise<{
    format: string;
    content: string;
    filename: string;
  }>;
  
  // Real-time data
  getRealTimeStats(): Promise<{
    activeUsers: number;
    onlineOrders: number;
    recentActivity: Array<{
      type: string;
      description: string;
      timestamp: Date;
    }>;
  }>;
}