import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import Seller from "@/models/Seller";
import Category from "@/models/Category";
import Review from "@/models/Review";
import { 
  IAdminDashboardRepository, 
  DashboardOverview, 
  SalesMetrics, 
  UserMetrics, 
  ProductMetrics, 
  SellerMetrics, 
  OrderMetrics,
  PaymentMetrics,
  ReviewMetrics
} from "./IAdminDashboardRepository";
import { EntityScope, TimePeriod } from "./AdminDashboardSchemas";
import { DashboardDataFetchError } from "./AdminDashboardErrors";
import { getStartDateFromPeriod } from "../../shared/dateUtils";

export class AdminDashboardRepository implements IAdminDashboardRepository {
  
  private getDateFilter(period?: TimePeriod): any {
    if (!period) return {};
    
    const startDate = getStartDateFromPeriod(period);
    return { createdAt: { $gte: startDate } };
  }

  private getPreviousDateFilter(period?: TimePeriod): any {
    const now = Date.now();
    const intervals: Record<TimePeriod, number> = {
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '12h': 12 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '1day': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000,
      'all': 0
    };
    
    if (!period) {
      return { createdAt: { $lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } };
    }
    
    const interval = intervals[period];
    return { 
      createdAt: { 
        $gte: new Date(now - 2 * interval),
        $lt: new Date(now - interval)
      }
    };
  }

  private async getRevenue(filter: any): Promise<number> {
    const result = await Order.aggregate([
      { $match: { ...filter, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    return result[0]?.total || 0;
  }

  private getStartOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }
  
  async getDashboardOverview(scope?: EntityScope): Promise<DashboardOverview> {
    const period = scope?.period;
    const dateFilter = this.getDateFilter(period);
    const previousDateFilter = this.getPreviousDateFilter(period);
    const paidFilter = { ...dateFilter, paymentStatus: 'paid' };
    const previousPaidFilter = { ...previousDateFilter, paymentStatus: 'paid' };

    const [
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      totalSellers,
      previousRevenue,
      previousOrders,
      previousUsers
    ] = await Promise.all([
      this.getRevenue(dateFilter),
      Order.countDocuments(paidFilter),
      User.countDocuments(dateFilter),
      Product.countDocuments({ ...dateFilter, status: 'APPROVED' }),
      Seller.countDocuments({ ...dateFilter, status: 'active' }),
      this.getRevenue(previousDateFilter),
      Order.countDocuments(previousPaidFilter),
      User.countDocuments(previousDateFilter)
    ]);

    return {
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      totalSellers,
      revenueGrowth: this.calculateGrowth(totalRevenue, previousRevenue),
      ordersGrowth: this.calculateGrowth(totalOrders, previousOrders),
      usersGrowth: this.calculateGrowth(totalUsers, previousUsers),
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      conversionRate: totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0
    };
  }

  async getSalesMetrics(scope?: EntityScope): Promise<SalesMetrics> {
    const period = scope?.period;
    const dateFilter = this.getDateFilter(period);
    
    const now = new Date();
    const todayStart = this.getStartOfDay(now);
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const [todayRevenue, weekRevenue, monthRevenue, yearRevenue] = await Promise.all([
      this.getRevenue({ createdAt: { $gte: todayStart }, ...dateFilter }),
      this.getRevenue({ createdAt: { $gte: weekStart }, ...dateFilter }),
      this.getRevenue({ createdAt: { $gte: monthStart }, ...dateFilter }),
      this.getRevenue({ createdAt: { $gte: yearStart }, ...dateFilter })
    ]);

    return { todayRevenue, weekRevenue, monthRevenue, yearRevenue };
  }

  async getUserMetrics(scope?: EntityScope): Promise<UserMetrics> {
    const period = scope?.period;
    const dateFilter = this.getDateFilter(period);
    const previousDateFilter = this.getPreviousDateFilter(period);
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      verifiedUsers,
      unverifiedUsers,
      previousNewUsers
    ] = await Promise.all([
      User.countDocuments(dateFilter),
      User.countDocuments({ ...dateFilter, lastLoginAt: { $gte: last30Days } }),
      User.countDocuments({ ...dateFilter, verified: true }),
      User.countDocuments({ ...dateFilter, verified: false }),
      User.countDocuments(previousDateFilter)
    ]);

    return {
      totalUsers,
      activeUsers,
      newUsers: totalUsers,
      verifiedUsers,
      unverifiedUsers,
      userGrowth: this.calculateGrowth(totalUsers, previousNewUsers)
    };
  }

  async getProductMetrics(scope?: EntityScope): Promise<ProductMetrics> {
    const period = scope?.period;
    const dateFilter = this.getDateFilter(period);
    
    const [
      totalProducts,
      publishedProducts,
      pendingProducts,
      draftProducts,
      outOfStockProducts,
      lowStockProducts,
      totalCategories
    ] = await Promise.all([
      Product.countDocuments(dateFilter),
      Product.countDocuments({ ...dateFilter, status: 'APPROVED', isPublished: true }),
      Product.countDocuments({ ...dateFilter, status: 'PENDING' }),
      Product.countDocuments({ ...dateFilter, status: 'DRAFT' }),
      Product.countDocuments({ ...dateFilter, inStockQuantity: { $lte: 0 } }),
      Product.countDocuments({ ...dateFilter, inStockQuantity: { $gt: 0, $lte: 10 } }),
      Category.countDocuments(dateFilter)
    ]);

    return {
      totalProducts,
      publishedProducts,
      pendingProducts,
      draftProducts,
      outOfStockProducts,
      lowStockProducts,
      totalCategories
    };
  }

  async getSellerMetrics(scope?: EntityScope): Promise<SellerMetrics> {
    const period = scope?.period;
    const dateFilter = this.getDateFilter(period);
    
    const [
      totalSellers,
      activeSellers,
      pendingSellers,
      suspendedSellers,
      verifiedSellers,
      inactiveSellers
    ] = await Promise.all([
      Seller.countDocuments(dateFilter),
      Seller.countDocuments({ ...dateFilter, status: 'active' }),
      Seller.countDocuments({ ...dateFilter, status: 'pending' }),
      Seller.countDocuments({ ...dateFilter, status: 'suspended' }),
      Seller.countDocuments({ ...dateFilter, verified: true }),
      Seller.countDocuments({ ...dateFilter, status: 'inactive' })
    ]);

    return {
      totalSellers,
      activeSellers,
      pendingSellers,
      suspendedSellers,
      verifiedSellers,
      inactiveSellers
    };
  }

  async getOrderMetrics(scope?: EntityScope): Promise<OrderMetrics> {
    const period = scope?.period;
    const dateFilter = this.getDateFilter(period);
    
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      returnedOrders
    ] = await Promise.all([
      Order.countDocuments(dateFilter),
      Order.countDocuments({ ...dateFilter, orderStatus: 'pending' }),
      Order.countDocuments({ ...dateFilter, orderStatus: 'processing' }),
      Order.countDocuments({ ...dateFilter, orderStatus: 'shipped' }),
      Order.countDocuments({ ...dateFilter, orderStatus: 'delivered' }),
      Order.countDocuments({ ...dateFilter, orderStatus: 'cancelled' }),
      Order.countDocuments({ ...dateFilter, orderStatus: 'returned' })
    ]);

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      returnedOrders
    };
  }

  async getPaymentMetrics(scope?: EntityScope): Promise<PaymentMetrics> {
    const period = scope?.period;
    const dateFilter = this.getDateFilter(period);
    
    const [
      totalPayments,
      paidOrders,
      pendingPayments,
      failedPayments,
      refundedPayments
    ] = await Promise.all([
      Order.countDocuments(dateFilter),
      Order.countDocuments({ ...dateFilter, paymentStatus: 'paid' }),
      Order.countDocuments({ ...dateFilter, paymentStatus: 'pending' }),
      Order.countDocuments({ ...dateFilter, paymentStatus: 'failed' }),
      Order.countDocuments({ ...dateFilter, paymentStatus: 'refunded' })
    ]);

    return {
      totalPayments,
      paidOrders,
      pendingPayments,
      failedPayments,
      refundedPayments
    };
  }

  async getReviewMetrics(scope?: EntityScope): Promise<ReviewMetrics> {
    const period = scope?.period;
    const dateFilter = this.getDateFilter(period);
    
    const [
      totalReviews,
      pendingReviews,
      approvedReviews,
      rejectedReviews,
      avgRating
    ] = await Promise.all([
      Review.countDocuments(dateFilter),
      Review.countDocuments({ ...dateFilter, status: 'pending' }),
      Review.countDocuments({ ...dateFilter, status: 'approved' }),
      Review.countDocuments({ ...dateFilter, status: 'rejected' }),
      Review.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]).then(result => result[0]?.avgRating || 0)
    ]);

    return {
      totalReviews,
      pendingReviews,
      approvedReviews,
      rejectedReviews,
      averageRating: Math.round(avgRating * 10) / 10
    };
  }

  async getRealTimeMetrics(): Promise<{
    activeUsers: number;
    ongoingOrders: number;
    todayRevenue: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
  }> {
    const now = new Date();
    const todayStart = this.getStartOfDay(now);
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    const [activeUsers, ongoingOrders, todayRevenue] = await Promise.all([
      User.countDocuments({ lastLoginAt: { $gte: lastHour } }),
      Order.countDocuments({ 
        orderStatus: { $in: ['pending', 'confirmed', 'processing', 'shipped'] }
      }),
      this.getRevenue({ createdAt: { $gte: todayStart } })
    ]);

    const systemHealth = ongoingOrders > 5000 ? 'critical' : ongoingOrders > 1000 ? 'warning' : 'healthy';

    return { activeUsers, ongoingOrders, todayRevenue, systemHealth };
  }
}

export const adminDashboardRepository = new AdminDashboardRepository();