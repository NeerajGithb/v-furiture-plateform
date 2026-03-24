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

    // Calculate previous period for growth comparison
    const currentStart: Date = (dateFilter as any).createdAt?.$gte || getStartDateFromPeriod('30d');
    const periodMs = Date.now() - currentStart.getTime();
    const prevStart = new Date(currentStart.getTime() - periodMs);
    const prevEnd = currentStart;
    const prevFilter = { createdAt: { $gte: prevStart, $lt: prevEnd } };

    const [revenueStats, userStats, productStats, sellerStats, prevRevenueStats, prevUserStats, prevOrderStats] = await Promise.all([
      Order.aggregate([
        { $match: { ...dateFilter, paymentStatus: 'paid', orderStatus: 'delivered' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, totalOrders: { $sum: 1 }, avgOrderValue: { $avg: '$totalAmount' } } }
      ]),
      User.countDocuments(dateFilter),
      Product.countDocuments(dateFilter),
      Seller.countDocuments(dateFilter),
      Order.aggregate([
        { $match: { ...prevFilter, paymentStatus: 'paid', orderStatus: 'delivered' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, totalOrders: { $sum: 1 } } }
      ]),
      User.countDocuments(prevFilter),
      Order.countDocuments({ ...prevFilter, paymentStatus: 'paid', orderStatus: 'delivered' }),
    ]);

    const current = revenueStats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
    const prev = prevRevenueStats[0] || { totalRevenue: 0, totalOrders: 0 };

    const calcGrowth = (curr: number, previous: number) =>
      previous > 0 ? Math.round(((curr - previous) / previous) * 100 * 10) / 10 : curr > 0 ? 100 : 0;

    return {
      totalRevenue: current.totalRevenue,
      totalOrders: current.totalOrders,
      totalUsers: userStats,
      totalProducts: productStats,
      totalSellers: sellerStats,
      revenueGrowth: calcGrowth(current.totalRevenue, prev.totalRevenue),
      ordersGrowth: calcGrowth(current.totalOrders, prev.totalOrders),
      usersGrowth: calcGrowth(userStats, prevUserStats),
      avgOrderValue: current.avgOrderValue,
      conversionRate: 0, // Requires session tracking — not available from order data alone
    };
  }

  async getAnalyticsMetrics(query: AdminAnalyticsQueryRequest): Promise<AnalyticsMetrics[]> {
    const dateFilter = this.getDateFilter(query);
    const groupFormat = this.getGroupFormat(query.groupBy);

    const dateGroup = { $dateToString: { format: groupFormat, date: '$createdAt' } };
    const paidFilter = { ...dateFilter, paymentStatus: 'paid', orderStatus: 'delivered' };

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
    const paidFilter = { ...dateFilter, paymentStatus: 'paid', orderStatus: 'delivered' };

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

    const currentStart: Date = (dateFilter as any).createdAt?.$gte || getStartDateFromPeriod('30d');
    const periodMs = Date.now() - currentStart.getTime();
    const prevStart = new Date(currentStart.getTime() - periodMs);
    const prevFilter = { createdAt: { $gte: prevStart, $lt: currentStart } };

    // New users in period
    const newUsers = await User.countDocuments(dateFilter);

    // Returning users = users created before the period who placed an order in the period
    const returningUsersAgg = await Order.aggregate([
      { $match: { ...dateFilter } },
      { $group: { _id: '$userId' } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $match: { 'user.createdAt': { $lt: currentStart } } },
      { $count: 'count' }
    ]);
    const returningUsers = returningUsersAgg[0]?.count || 0;

    // Active users = users who placed at least one order in the period
    const activeUsersAgg = await Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$userId' } },
      { $count: 'count' }
    ]);
    const activeUsers = activeUsersAgg[0]?.count || 0;

    // Retention rate = returning / (new + returning)
    const totalEngaged = newUsers + returningUsers;
    const userRetentionRate = totalEngaged > 0
      ? Math.round((returningUsers / totalEngaged) * 100 * 10) / 10
      : 0;

    // Users by location from shipping addresses
    const locationAgg = await Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$shippingAddress.state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    const totalLocationOrders = locationAgg.reduce((s: number, l: any) => s + l.count, 0);
    const usersByLocation = locationAgg
      .filter((l: any) => l._id)
      .map((l: any) => ({
        location: l._id,
        count: l.count,
        percentage: totalLocationOrders > 0 ? Math.round((l.count / totalLocationOrders) * 100) : 0
      }));

    return {
      newUsers,
      activeUsers,
      returningUsers,
      userRetentionRate,
      avgSessionDuration: 0, // Requires client-side session tracking
      bounceRate: 0,         // Requires client-side session tracking
      usersByLocation
    };
  }

  async getSalesAnalytics(query: AdminAnalyticsQueryRequest): Promise<SalesAnalytics> {
    const dateFilter = this.getDateFilter(query);
    const paidFilter = { ...dateFilter, paymentStatus: 'paid', orderStatus: 'delivered' };

    const currentStart: Date = (dateFilter as any).createdAt?.$gte || getStartDateFromPeriod('30d');
    const periodMs = Date.now() - currentStart.getTime();
    const prevStart = new Date(currentStart.getTime() - periodMs);
    const prevPaidFilter = { createdAt: { $gte: prevStart, $lt: currentStart }, paymentStatus: 'paid', orderStatus: 'delivered' };

    const [salesStats, prevSalesStats, ordersByStatus, paymentMethods] = await Promise.all([
      Order.aggregate([
        { $match: paidFilter },
        { $group: { _id: null, totalSales: { $sum: '$totalAmount' }, avgOrderValue: { $avg: '$totalAmount' }, orderCount: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: prevPaidFilter },
        { $group: { _id: null, totalSales: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $match: paidFilter },
        { $group: { _id: '$paymentMethod', count: { $sum: 1 }, amount: { $sum: '$totalAmount' } } }
      ])
    ]);

    const sales = salesStats[0] || { totalSales: 0, avgOrderValue: 0, orderCount: 0 };
    const prevSales = prevSalesStats[0]?.totalSales || 0;
    const salesGrowth = prevSales > 0
      ? Math.round(((sales.totalSales - prevSales) / prevSales) * 100 * 10) / 10
      : sales.totalSales > 0 ? 100 : 0;

    const totalOrders = ordersByStatus.reduce((sum: number, s: any) => sum + s.count, 0);
    const totalPaymentAmount = paymentMethods.reduce((sum: number, m: any) => sum + m.amount, 0);

    return {
      totalSales: sales.totalSales,
      salesGrowth,
      avgOrderValue: sales.avgOrderValue,
      ordersByStatus: ordersByStatus.map((s: any) => ({
        status: s._id,
        count: s.count,
        percentage: totalOrders > 0 ? Math.round((s.count / totalOrders) * 100) : 0
      })),
      paymentMethods: paymentMethods.map((m: any) => ({
        method: m._id || 'Unknown',
        count: m.count,
        amount: m.amount,
        percentage: totalPaymentAmount > 0 ? Math.round((m.amount / totalPaymentAmount) * 100) : 0
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