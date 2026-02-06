import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import Seller from "@/models/Seller";
import Category from "@/models/Category";
import { 
  AnalyticsDataFetchError,
  InvalidDateRangeError,
  AnalyticsExportError,
  MetricsCalculationError
} from "./AdminAnalyticsErrors";
import { 
  IAdminAnalyticsRepository, 
  AnalyticsOverview, 
  AnalyticsMetrics, 
  TopPerformers,
  UserAnalytics,
  SalesAnalytics
} from "./IAdminAnalyticsRepository";
import { AdminAnalyticsQueryRequest, AnalyticsExportRequest } from "./AdminAnalyticsSchemas";

export class AdminAnalyticsRepository implements IAdminAnalyticsRepository {
  private getDateFilter(query: AdminAnalyticsQueryRequest) {
    const { period, startDate, endDate } = query;
    const now = new Date();
    
    if (period === 'custom' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start >= end) {
        throw new InvalidDateRangeError();
      }
      
      return { createdAt: { $gte: start, $lte: end } };
    }

    let start: Date;
    switch (period) {
      case '7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return { createdAt: { $gte: start } };
  }

  async getAnalyticsOverview(query: AdminAnalyticsQueryRequest): Promise<AnalyticsOverview> {
    try {
      const dateFilter = this.getDateFilter(query);
      
      // Get current period stats
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
      
      // Calculate growth (simplified - would need previous period comparison)
      const revenueGrowth = 0; // Placeholder
      const ordersGrowth = 0; // Placeholder
      const usersGrowth = 0; // Placeholder
      const conversionRate = 0; // Placeholder

      return {
        totalRevenue: currentStats.totalRevenue,
        totalOrders: currentStats.totalOrders,
        totalUsers: userStats,
        totalProducts: productStats,
        totalSellers: sellerStats,
        revenueGrowth,
        ordersGrowth,
        usersGrowth,
        avgOrderValue: currentStats.avgOrderValue,
        conversionRate,
      };
    } catch (error) {
      if (error instanceof InvalidDateRangeError) {
        throw error;
      }
      console.error("Error fetching analytics overview:", error);
      throw new AnalyticsDataFetchError();
    }
  }

  async getAnalyticsMetrics(query: AdminAnalyticsQueryRequest): Promise<AnalyticsMetrics[]> {
    try {
      const dateFilter = this.getDateFilter(query);
      const { groupBy } = query;

      let groupFormat: string;
      switch (groupBy) {
        case 'day':
          groupFormat = '%Y-%m-%d';
          break;
        case 'week':
          groupFormat = '%Y-%U';
          break;
        case 'month':
          groupFormat = '%Y-%m';
          break;
        default:
          groupFormat = '%Y-%m-%d';
      }

      const metrics = await Order.aggregate([
        { $match: { ...dateFilter, paymentStatus: 'paid' } },
        {
          $group: {
            _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
            avgOrderValue: { $avg: '$totalAmount' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Get user and product metrics for the same periods
      const userMetrics = await User.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
            users: { $sum: 1 }
          }
        }
      ]);

      const productMetrics = await Product.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
            products: { $sum: 1 }
          }
        }
      ]);

      const sellerMetrics = await Seller.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
            sellers: { $sum: 1 }
          }
        }
      ]);

      // Combine all metrics
      const metricsMap = new Map();
      
      metrics.forEach((item: any) => {
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
        const existing = metricsMap.get(item._id) || { date: item._id, revenue: 0, orders: 0, avgOrderValue: 0, products: 0, sellers: 0 };
        existing.users = item.users;
        metricsMap.set(item._id, existing);
      });

      productMetrics.forEach((item: any) => {
        const existing = metricsMap.get(item._id) || { date: item._id, revenue: 0, orders: 0, avgOrderValue: 0, users: 0, sellers: 0 };
        existing.products = item.products;
        metricsMap.set(item._id, existing);
      });

      sellerMetrics.forEach((item: any) => {
        const existing = metricsMap.get(item._id) || { date: item._id, revenue: 0, orders: 0, avgOrderValue: 0, users: 0, products: 0 };
        existing.sellers = item.sellers;
        metricsMap.set(item._id, existing);
      });

      return Array.from(metricsMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error("Error fetching analytics metrics:", error);
      throw new MetricsCalculationError("analytics metrics");
    }
  }

  async getTopPerformers(query: AdminAnalyticsQueryRequest): Promise<TopPerformers> {
    try {
      const dateFilter = this.getDateFilter(query);

      const [topProducts, topSellers, topCategories] = await Promise.all([
        // Top Products
        Order.aggregate([
          { $match: { ...dateFilter, paymentStatus: 'paid' } },
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

        // Top Sellers
        Order.aggregate([
          { $match: { ...dateFilter, paymentStatus: 'paid' } },
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

        // Top Categories
        Order.aggregate([
          { $match: { ...dateFilter, paymentStatus: 'paid' } },
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

      // Calculate percentages for categories
      const totalCategoryRevenue = topCategories.reduce((sum: number, cat: any) => sum + cat.revenue, 0);
      const formattedCategories = topCategories.map((cat: any) => ({
        ...cat,
        id: cat.id.toString(),
        percentage: totalCategoryRevenue > 0 ? Math.round((cat.revenue / totalCategoryRevenue) * 100) : 0
      }));

      return {
        topProducts: topProducts.map((product: any) => ({
          ...product,
          id: product.id.toString()
        })),
        topSellers: topSellers.map((seller: any) => ({
          ...seller,
          id: seller.id.toString()
        })),
        topCategories: formattedCategories
      };
    } catch (error) {
      console.error("Error fetching top performers:", error);
      throw new MetricsCalculationError("top performers");
    }
  }

  async getUserAnalytics(query: AdminAnalyticsQueryRequest): Promise<UserAnalytics> {
    try {
      const dateFilter = this.getDateFilter(query);
      
      // Simplified user analytics - would need more complex tracking in real app
      const userStats = await User.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            newUsers: { $sum: 1 },
            // These would need proper session tracking
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
        userRetentionRate: 0, // Would need session data
        avgSessionDuration: 0, // Would need session data
        bounceRate: 0, // Would need session data
        usersByLocation: [] // Would need location tracking
      };
    } catch (error) {
      console.error("Error fetching user analytics:", error);
      throw new MetricsCalculationError("user analytics");
    }
  }

  async getSalesAnalytics(query: AdminAnalyticsQueryRequest): Promise<SalesAnalytics> {
    try {
      const dateFilter = this.getDateFilter(query);
      
      const [salesStats, ordersByStatus, paymentMethods] = await Promise.all([
        Order.aggregate([
          { $match: { ...dateFilter, paymentStatus: 'paid' } },
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
          { $match: { ...dateFilter, paymentStatus: 'paid' } },
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
        salesGrowth: 0, // Would need previous period comparison
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
    } catch (error) {
      console.error("Error fetching sales analytics:", error);
      throw new MetricsCalculationError("sales analytics");
    }
  }

  async exportAnalytics(query: AnalyticsExportRequest): Promise<{ format: string; content: string; filename: string; }> {
    try {
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

      // CSV format
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
    } catch (error) {
      console.error("Error exporting analytics:", error);
      throw new AnalyticsExportError();
    }
  }

  async getRealTimeStats(): Promise<{ activeUsers: number; onlineOrders: number; recentActivity: Array<{ type: string; description: string; timestamp: Date; }>; }> {
    try {
      // Simplified real-time stats - would need proper real-time tracking
      const now = new Date();
      const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

      const [recentOrders, recentUsers] = await Promise.all([
        Order.countDocuments({ createdAt: { $gte: lastHour } }),
        User.countDocuments({ createdAt: { $gte: lastHour } })
      ]);

      const recentActivity = await Order.find({ createdAt: { $gte: lastHour } })
        .populate('userId', 'name')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      return {
        activeUsers: recentUsers,
        onlineOrders: recentOrders,
        recentActivity: recentActivity.map((order: any) => ({
          type: 'order',
          description: `New order #${order.orderNumber} by ${order.userId?.name || 'Unknown'}`,
          timestamp: order.createdAt
        }))
      };
    } catch (error) {
      console.error("Error fetching real-time stats:", error);
      throw new AnalyticsDataFetchError("Failed to fetch real-time stats");
    }
  }
}

export const adminAnalyticsRepository = new AdminAnalyticsRepository();