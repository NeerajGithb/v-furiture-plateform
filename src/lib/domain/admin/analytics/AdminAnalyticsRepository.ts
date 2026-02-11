import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import Seller from "@/models/Seller";
import { InvalidDateRangeError } from "./AdminAnalyticsErrors";
import { 
  IAdminAnalyticsRepository, 
  AnalyticsOverview, 
  AnalyticsMetrics, 
  TopPerformers,
  UserAnalytics,
  SalesAnalytics
} from "./IAdminAnalyticsRepository";
import { AdminAnalyticsQueryRequest, AnalyticsExportRequest } from "./AdminAnalyticsSchemas";
import { getStartDateFromPeriod } from "../../shared/dateUtils";
import { RepositoryError } from "../../shared/InfrastructureError";

export class AdminAnalyticsRepository implements IAdminAnalyticsRepository {
  private getDateFilter(query: AdminAnalyticsQueryRequest) {
    const { period, startDate, endDate } = query;
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start >= end) {
        throw new InvalidDateRangeError();
      }
      
      return { createdAt: { $gte: start, $lte: end } };
    }

    if (period) {
      const start = getStartDateFromPeriod(period);
      return { createdAt: { $gte: start } };
    }

    return {};
  }

  private getGroupFormat(groupBy: string = 'day'): string {
    const formats: Record<string, string> = {
      day: '%Y-%m-%d',
      week: '%Y-%U',
      month: '%Y-%m'
    };
    return formats[groupBy] || formats.day;
  }

  async getAnalyticsOverview(query: AdminAnalyticsQueryRequest): Promise<AnalyticsOverview> {
    const dateFilter = this.getDateFilter(query);
    
    const [revenueStats, userStats, productStats, sellerStats] = await Promise.all([
      Order.aggregate([
        { $match: { ...dateFilter, paymentStatus: 'paid' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$totalAmount' }
          }
        }
      ]),
      User.countDocuments(dateFilter),
      Product.countDocuments(dateFilter),
      Seller.countDocuments(dateFilter)
    ]);

    const currentStats = revenueStats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };

    return {
      totalRevenue: currentStats.totalRevenue,
      totalOrders: currentStats.totalOrders,
      totalUsers: userStats,
      totalProducts: productStats,
      totalSellers: sellerStats,
      revenueGrowth: 0,
      ordersGrowth: 0,
      usersGrowth: 0,
      avgOrderValue: currentStats.avgOrderValue,
      conversionRate: 0,
    };
  }

  async getAnalyticsMetrics(query: AdminAnalyticsQueryRequest): Promise<AnalyticsMetrics[]> {
    const dateFilter = this.getDateFilter(query);
    const groupFormat = this.getGroupFormat(query.groupBy);

    const dateGroup = { $dateToString: { format: groupFormat, date: '$createdAt' } };
    const paidFilter = { ...dateFilter, paymentStatus: 'paid' };

    const [orderMetrics, userMetrics, productMetrics, sellerMetrics] = await Promise.all([
      Order.aggregate([
        { $match: paidFilter },
        {
          $group: {
            _id: dateGroup,
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
            avgOrderValue: { $avg: '$totalAmount' }
          }
        }
      ]),
      User.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: dateGroup,
            users: { $sum: 1 }
          }
        }
      ]),
      Product.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: dateGroup,
            products: { $sum: 1 }
          }
        }
      ]),
      Seller.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: dateGroup,
            sellers: { $sum: 1 }
          }
        }
      ])
    ]);

    const metricsMap = new Map<string, AnalyticsMetrics>();
    
    orderMetrics.forEach((item: any) => {
      metricsMap.set(item._id, {
        date: item._id,
        revenue: item.revenue,
        orders: item.orders,
        avgOrderValue: item.avgOrderValue,
        users: 0,
        products: 0,
        sellers: 0,
      });
    });

    userMetrics.forEach((item: any) => {
      const existing = metricsMap.get(item._id);
      if (existing) {
        existing.users = item.users;
      } else {
        metricsMap.set(item._id, {
          date: item._id,
          revenue: 0,
          orders: 0,
          avgOrderValue: 0,
          users: item.users,
          products: 0,
          sellers: 0
        });
      }
    });

    productMetrics.forEach((item: any) => {
      const existing = metricsMap.get(item._id);
      if (existing) {
        existing.products = item.products;
      } else {
        metricsMap.set(item._id, {
          date: item._id,
          revenue: 0,
          orders: 0,
          avgOrderValue: 0,
          users: 0,
          products: item.products,
          sellers: 0
        });
      }
    });

    sellerMetrics.forEach((item: any) => {
      const existing = metricsMap.get(item._id);
      if (existing) {
        existing.sellers = item.sellers;
      } else {
        metricsMap.set(item._id, {
          date: item._id,
          revenue: 0,
          orders: 0,
          avgOrderValue: 0,
          users: 0,
          products: 0,
          sellers: item.sellers
        });
      }
    });

    return Array.from(metricsMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getTopPerformers(query: AdminAnalyticsQueryRequest): Promise<TopPerformers> {
    const dateFilter = this.getDateFilter(query);
    const paidFilter = { ...dateFilter, paymentStatus: 'paid' };

    const [topProducts, topSellers, topCategories] = await Promise.all([
      Order.aggregate([
        { $match: paidFilter },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            revenue: { $sum: '$items.totalPrice' },
            orders: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $lookup: {
            from: 'categories',
            localField: 'product.categoryId',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: '$category' },
        {
          $project: {
            id: '$_id',
            name: '$product.name',
            revenue: 1,
            orders: 1,
            category: '$category.name'
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
      ]),

      Order.aggregate([
        { $match: paidFilter },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.sellerId',
            revenue: { $sum: '$items.totalPrice' },
            orders: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'sellers',
            localField: '_id',
            foreignField: '_id',
            as: 'seller'
          }
        },
        { $unwind: '$seller' },
        {
          $project: {
            id: '$_id',
            name: '$seller.businessName',
            revenue: 1,
            orders: 1,
            commission: { $multiply: ['$revenue', 0.1] }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
      ]),

      Order.aggregate([
        { $match: paidFilter },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $group: {
            _id: '$product.categoryId',
            revenue: { $sum: '$items.totalPrice' },
            orders: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: '$category' },
        {
          $project: {
            id: '$_id',
            name: '$category.name',
            revenue: 1,
            orders: 1
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
      ])
    ]);

    const totalCategoryRevenue = topCategories.reduce((sum: number, cat: any) => sum + cat.revenue, 0);

    return {
      topProducts: topProducts.map((product: any) => ({
        ...product,
        id: product.id.toString()
      })),
      topSellers: topSellers.map((seller: any) => ({
        ...seller,
        id: seller.id.toString()
      })),
      topCategories: topCategories.map((cat: any) => ({
        ...cat,
        id: cat.id.toString(),
        percentage: totalCategoryRevenue > 0 ? Math.round((cat.revenue / totalCategoryRevenue) * 100) : 0
      }))
    };
  }

  async getUserAnalytics(query: AdminAnalyticsQueryRequest): Promise<UserAnalytics> {
    const dateFilter = this.getDateFilter(query);
    
    const userStats = await User.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          newUsers: { $sum: 1 },
          activeUsers: { $sum: 1 },
          returningUsers: { $sum: 0 }
        }
      }
    ]);

    const stats = userStats[0] || { newUsers: 0, activeUsers: 0, returningUsers: 0 };

    return {
      newUsers: stats.newUsers,
      activeUsers: stats.activeUsers,
      returningUsers: stats.returningUsers,
      userRetentionRate: 0,
      avgSessionDuration: 0,
      bounceRate: 0,
      usersByLocation: []
    };
  }

  async getSalesAnalytics(query: AdminAnalyticsQueryRequest): Promise<SalesAnalytics> {
    const dateFilter = this.getDateFilter(query);
    const paidFilter = { ...dateFilter, paymentStatus: 'paid' };
    
    const [salesStats, ordersByStatus, paymentMethods] = await Promise.all([
      Order.aggregate([
        { $match: paidFilter },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$totalAmount' },
            avgOrderValue: { $avg: '$totalAmount' },
            orderCount: { $sum: 1 }
          }
        }
      ]),
      Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$orderStatus',
            count: { $sum: 1 }
          }
        }
      ]),
      Order.aggregate([
        { $match: paidFilter },
        {
          $group: {
            _id: '$paymentMethod',
            count: { $sum: 1 },
            amount: { $sum: '$totalAmount' }
          }
        }
      ])
    ]);

    const sales = salesStats[0] || { totalSales: 0, avgOrderValue: 0, orderCount: 0 };
    const totalOrders = ordersByStatus.reduce((sum: number, status: any) => sum + status.count, 0);
    const totalPaymentAmount = paymentMethods.reduce((sum: number, method: any) => sum + method.amount, 0);

    return {
      totalSales: sales.totalSales,
      salesGrowth: 0,
      avgOrderValue: sales.avgOrderValue,
      ordersByStatus: ordersByStatus.map((status: any) => ({
        status: status._id,
        count: status.count,
        percentage: totalOrders > 0 ? Math.round((status.count / totalOrders) * 100) : 0
      })),
      paymentMethods: paymentMethods.map((method: any) => ({
        method: method._id || 'Unknown',
        count: method.count,
        amount: method.amount,
        percentage: totalPaymentAmount > 0 ? Math.round((method.amount / totalPaymentAmount) * 100) : 0
      }))
    };
  }

  async exportAnalytics(query: AnalyticsExportRequest): Promise<{ format: string; content: string; filename: string; }> {
    const analyticsQuery: AdminAnalyticsQueryRequest = {
      period: query.period,
      startDate: query.startDate,
      endDate: query.endDate,
      groupBy: 'day'
    };

    const [overview, metrics] = await Promise.all([
      this.getAnalyticsOverview(analyticsQuery),
      this.getAnalyticsMetrics(analyticsQuery)
    ]);

    const timestamp = new Date().toISOString().split('T')[0];

    if (query.format === 'json') {
      return {
        format: 'json',
        content: JSON.stringify({ overview, metrics }, null, 2),
        filename: `analytics-export-${timestamp}.json`
      };
    }

    const headers = ['Date', 'Revenue', 'Orders', 'Users', 'Products', 'Sellers', 'Avg Order Value'];
    const csvRows = [
      headers.join(','),
      ...metrics.map(metric => [
        metric.date,
        metric.revenue,
        metric.orders,
        metric.users,
        metric.products,
        metric.sellers,
        metric.avgOrderValue
      ].join(','))
    ];

    return {
      format: 'csv',
      content: csvRows.join('\n'),
      filename: `analytics-export-${timestamp}.csv`
    };
  }

  async getRealTimeStats(): Promise<{ activeUsers: number; onlineOrders: number; recentActivity: Array<{ type: string; description: string; timestamp: Date; }>; }> {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    const recentFilter = { createdAt: { $gte: lastHour } };

    const [recentOrders, recentUsers, recentActivity] = await Promise.all([
      Order.countDocuments(recentFilter),
      User.countDocuments(recentFilter),
      Order.find(recentFilter)
        .populate('userId', 'name')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
    ]);

    return {
      activeUsers: recentUsers,
      onlineOrders: recentOrders,
      recentActivity: recentActivity.map((order: any) => ({
        type: 'order',
        description: `New order #${order.orderNumber} by ${order.userId?.name || 'Unknown'}`,
        timestamp: order.createdAt
      }))
    };
  }
}

export const adminAnalyticsRepository = new AdminAnalyticsRepository();