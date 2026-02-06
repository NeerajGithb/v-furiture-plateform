import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import Seller from "@/models/Seller";
import Category from "@/models/Category";
import { 
  IAdminDashboardRepository, 
  DashboardOverview, 
  SalesMetrics, 
  UserMetrics, 
  ProductMetrics, 
  SellerMetrics, 
  OrderMetrics,
  DashboardWidget,
  DashboardLayout
} from "./IAdminDashboardRepository";
import { AdminDashboardQueryRequest, DashboardLayoutRequest } from "./AdminDashboardSchemas";
import { DashboardDataFetchError, DashboardStatsError, WidgetNotFoundError } from "./AdminDashboardErrors";

export class AdminDashboardRepository implements IAdminDashboardRepository {
  async getDashboardOverview(query: AdminDashboardQueryRequest): Promise<DashboardOverview> {
    try {
      const dateFilter = this.getDateFilter(query.period);
      const previousDateFilter = this.getPreviousDateFilter(query.period);

      // Current period stats
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
        Order.aggregate([
          { $match: { ...dateFilter, paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]).then(result => result[0]?.total || 0),
        
        Order.countDocuments({ ...dateFilter, paymentStatus: 'paid' }),
        User.countDocuments(dateFilter),
        Product.countDocuments({ ...dateFilter, status: 'APPROVED' }),
        Seller.countDocuments({ ...dateFilter, status: 'active' }),
        
        // Previous period for growth calculation
        Order.aggregate([
          { $match: { ...previousDateFilter, paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]).then(result => result[0]?.total || 0),
        
        Order.countDocuments({ ...previousDateFilter, paymentStatus: 'paid' }),
        User.countDocuments(previousDateFilter)
      ]);

      // Calculate growth percentages
      const revenueGrowth = this.calculateGrowth(totalRevenue, previousRevenue);
      const ordersGrowth = this.calculateGrowth(totalOrders, previousOrders);
      const usersGrowth = this.calculateGrowth(totalUsers, previousUsers);

      // Calculate average order value
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Calculate conversion rate (simplified - orders vs users)
      const conversionRate = totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0;

      return {
        totalRevenue,
        totalOrders,
        totalUsers,
        totalProducts,
        totalSellers,
        revenueGrowth,
        ordersGrowth,
        usersGrowth,
        avgOrderValue,
        conversionRate
      };
    } catch (error) {
      throw new DashboardDataFetchError('overview');
    }
  }

  async getSalesMetrics(query: AdminDashboardQueryRequest): Promise<SalesMetrics> {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const yearStart = new Date(now.getFullYear(), 0, 1);

      const [todayRevenue, weekRevenue, monthRevenue, yearRevenue, salesTrend, topSellingProducts] = await Promise.all([
        Order.aggregate([
          { $match: { createdAt: { $gte: todayStart }, paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]).then(result => result[0]?.total || 0),

        Order.aggregate([
          { $match: { createdAt: { $gte: weekStart }, paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]).then(result => result[0]?.total || 0),

        Order.aggregate([
          { $match: { createdAt: { $gte: monthStart }, paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]).then(result => result[0]?.total || 0),

        Order.aggregate([
          { $match: { createdAt: { $gte: yearStart }, paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]).then(result => result[0]?.total || 0),

        // Sales trend for the last 30 days
        Order.aggregate([
          { 
            $match: { 
              createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
              paymentStatus: 'paid'
            }
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              revenue: { $sum: '$totalAmount' },
              orders: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]).then(results => results.map(r => ({
          date: r._id,
          revenue: r.revenue,
          orders: r.orders
        }))),

        // Top selling products
        Order.aggregate([
          { $match: { paymentStatus: 'paid' } },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.productId',
              name: { $first: '$items.name' },
              revenue: { $sum: '$items.totalPrice' },
              quantity: { $sum: '$items.quantity' }
            }
          },
          { $sort: { revenue: -1 } },
          { $limit: 10 }
        ]).then(results => results.map(r => ({
          id: r._id.toString(),
          name: r.name,
          revenue: r.revenue,
          quantity: r.quantity
        })))
      ]);

      return {
        todayRevenue,
        weekRevenue,
        monthRevenue,
        yearRevenue,
        salesTrend,
        topSellingProducts
      };
    } catch (error) {
      throw new DashboardDataFetchError('sales');
    }
  }

  async getUserMetrics(query: AdminDashboardQueryRequest): Promise<UserMetrics> {
    try {
      const dateFilter = this.getDateFilter(query.period);
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // First get total users count
      const totalUsersCount = await User.countDocuments();

      const [totalUsers, activeUsers, newUsers, userGrowth, usersByLocation, userActivity] = await Promise.all([
        Promise.resolve(totalUsersCount),
        User.countDocuments({ lastLoginAt: { $gte: monthStart } }),
        User.countDocuments(dateFilter),
        
        // Calculate user growth
        Promise.all([
          User.countDocuments(dateFilter),
          User.countDocuments(this.getPreviousDateFilter(query.period))
        ]).then(([current, previous]) => this.calculateGrowth(current, previous)),

        // Users by location (simplified - using a mock distribution)
        Promise.resolve([
          { location: 'Mumbai', count: Math.floor(totalUsersCount * 0.25), percentage: 25 },
          { location: 'Delhi', count: Math.floor(totalUsersCount * 0.20), percentage: 20 },
          { location: 'Bangalore', count: Math.floor(totalUsersCount * 0.15), percentage: 15 },
          { location: 'Chennai', count: Math.floor(totalUsersCount * 0.12), percentage: 12 },
          { location: 'Others', count: Math.floor(totalUsersCount * 0.28), percentage: 28 }
        ]),

        // User activity for last 30 days
        User.aggregate([
          {
            $match: {
              createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
            }
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              newUsers: { $sum: 1 },
              activeUsers: { $sum: { $cond: [{ $gte: ["$lastLoginAt", "$createdAt"] }, 1, 0] } }
            }
          },
          { $sort: { _id: 1 } }
        ]).then(results => results.map(r => ({
          date: r._id,
          activeUsers: r.activeUsers,
          newUsers: r.newUsers
        })))
      ]);

      return {
        totalUsers,
        activeUsers,
        newUsers,
        userGrowth,
        usersByLocation,
        userActivity
      };
    } catch (error) {
      throw new DashboardDataFetchError('users');
    }
  }

  async getProductMetrics(query: AdminDashboardQueryRequest): Promise<ProductMetrics> {
    try {
      const [
        totalProducts,
        publishedProducts,
        pendingProducts,
        outOfStockProducts,
        productsByCategory,
        recentProducts
      ] = await Promise.all([
        Product.countDocuments(),
        Product.countDocuments({ status: 'APPROVED', isPublished: true }),
        Product.countDocuments({ status: 'PENDING' }),
        Product.countDocuments({ inStockQuantity: { $lte: 0 } }),

        // Products by category
        Product.aggregate([
          { $match: { status: 'APPROVED' } },
          {
            $lookup: {
              from: 'categories',
              localField: 'categoryId',
              foreignField: '_id',
              as: 'category'
            }
          },
          { $unwind: '$category' },
          {
            $group: {
              _id: '$categoryId',
              categoryName: { $first: '$category.name' },
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ]).then(results => {
          const total = results.reduce((sum, r) => sum + r.count, 0);
          return results.map(r => ({
            categoryId: r._id.toString(),
            categoryName: r.categoryName,
            count: r.count,
            percentage: total > 0 ? Math.round((r.count / total) * 100) : 0
          }));
        }),

        // Recent products
        Product.find({ status: 'PENDING' })
          .sort({ createdAt: -1 })
          .limit(10)
          .select('name status createdAt')
          .lean()
          .then(products => products.map((p: any) => ({
            id: p._id.toString(),
            name: p.name,
            status: p.status,
            createdAt: p.createdAt
          })))
      ]);

      return {
        totalProducts,
        publishedProducts,
        pendingProducts,
        outOfStockProducts,
        productsByCategory,
        recentProducts
      };
    } catch (error) {
      throw new DashboardDataFetchError('products');
    }
  }

  async getSellerMetrics(query: AdminDashboardQueryRequest): Promise<SellerMetrics> {
    try {
      const dateFilter = this.getDateFilter(query.period);

      const [
        totalSellers,
        activeSellers,
        pendingSellers,
        verifiedSellers,
        topSellers,
        sellerGrowth
      ] = await Promise.all([
        Seller.countDocuments(),
        Seller.countDocuments({ status: 'active' }),
        Seller.countDocuments({ status: 'pending' }),
        Seller.countDocuments({ verified: true }),

        // Top sellers by revenue
        Seller.find({ status: 'active' })
          .sort({ revenue: -1 })
          .limit(10)
          .select('businessName revenue totalSales rating')
          .lean()
          .then(sellers => sellers.map((s: any) => ({
            id: s._id.toString(),
            name: s.businessName,
            revenue: s.revenue || 0,
            orders: s.totalSales || 0,
            rating: s.rating || 0
          }))),

        // Seller growth over time
        Seller.aggregate([
          {
            $match: {
              createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              newSellers: { $sum: 1 },
              activeSellers: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } }
            }
          },
          { $sort: { _id: 1 } }
        ]).then(results => results.map(r => ({
          date: r._id,
          newSellers: r.newSellers,
          activeSellers: r.activeSellers
        })))
      ]);

      return {
        totalSellers,
        activeSellers,
        pendingSellers,
        verifiedSellers,
        topSellers,
        sellerGrowth
      };
    } catch (error) {
      throw new DashboardDataFetchError('sellers');
    }
  }

  async getOrderMetrics(query: AdminDashboardQueryRequest): Promise<OrderMetrics> {
    try {
      const [
        totalOrders,
        pendingOrders,
        processingOrders,
        completedOrders,
        cancelledOrders,
        ordersByStatus,
        recentOrders
      ] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ orderStatus: 'pending' }),
        Order.countDocuments({ orderStatus: 'processing' }),
        Order.countDocuments({ orderStatus: 'delivered' }),
        Order.countDocuments({ orderStatus: 'cancelled' }),

        // Orders by status
        Order.aggregate([
          {
            $group: {
              _id: '$orderStatus',
              count: { $sum: 1 }
            }
          }
        ]).then(results => {
          const total = results.reduce((sum, r) => sum + r.count, 0);
          return results.map(r => ({
            status: r._id,
            count: r.count,
            percentage: total > 0 ? Math.round((r.count / total) * 100) : 0
          }));
        }),

        // Recent orders
        Order.find()
          .sort({ createdAt: -1 })
          .limit(10)
          .populate('userId', 'name')
          .select('orderNumber totalAmount orderStatus createdAt userId')
          .lean()
          .then(orders => orders.map((o: any) => ({
            id: o._id.toString(),
            orderNumber: o.orderNumber,
            customerName: (o.userId as any)?.name || 'Unknown',
            amount: o.totalAmount,
            status: o.orderStatus,
            createdAt: o.createdAt
          })))
      ]);

      return {
        totalOrders,
        pendingOrders,
        processingOrders,
        completedOrders,
        cancelledOrders,
        ordersByStatus,
        recentOrders
      };
    } catch (error) {
      throw new DashboardDataFetchError('orders');
    }
  }

  async getWidget(widgetId: string): Promise<DashboardWidget | null> {
    // This would typically fetch from a widgets collection
    // For now, return null as widgets are not implemented
    return null;
  }

  async updateWidget(widgetId: string, data: any): Promise<DashboardWidget> {
    throw new WidgetNotFoundError(widgetId);
  }

  async getDashboardLayout(adminId: string): Promise<DashboardLayout | null> {
    // This would typically fetch from an admin preferences collection
    // For now, return a default layout
    return {
      widgets: [
        { widgetId: 'overview', position: { x: 0, y: 0, width: 12, height: 4 } },
        { widgetId: 'sales', position: { x: 0, y: 4, width: 6, height: 6 } },
        { widgetId: 'orders', position: { x: 6, y: 4, width: 6, height: 6 } }
      ],
      layout: 'grid',
      lastModified: new Date()
    };
  }

  async updateDashboardLayout(adminId: string, layout: DashboardLayoutRequest): Promise<DashboardLayout> {
    // This would typically update an admin preferences collection
    return {
      ...layout,
      lastModified: new Date()
    };
  }

  async getRealTimeMetrics(): Promise<{
    activeUsers: number;
    ongoingOrders: number;
    todayRevenue: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
  }> {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

      const [activeUsers, ongoingOrders, todayRevenue] = await Promise.all([
        User.countDocuments({ lastLoginAt: { $gte: lastHour } }),
        Order.countDocuments({ 
          orderStatus: { $in: ['pending', 'confirmed', 'processing', 'shipped'] }
        }),
        Order.aggregate([
          { $match: { createdAt: { $gte: todayStart }, paymentStatus: 'paid' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]).then(result => result[0]?.total || 0)
      ]);

      // Simple system health check based on metrics
      let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (ongoingOrders > 1000) systemHealth = 'warning';
      if (ongoingOrders > 5000) systemHealth = 'critical';

      return {
        activeUsers,
        ongoingOrders,
        todayRevenue,
        systemHealth
      };
    } catch (error) {
      throw new DashboardStatsError('Failed to fetch real-time metrics');
    }
  }

  private getDateFilter(period: string): any {
    const now = new Date();
    
    switch (period) {
      case '1h':
        return { createdAt: { $gte: new Date(now.getTime() - 60 * 60 * 1000) } };
      case '24h':
        return { createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } };
      case '7d':
        return { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
      case '30d':
        return { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
      case '90d':
        return { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
      case '1y':
        return { createdAt: { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) } };
      case 'all':
      default:
        return {};
    }
  }

  private getPreviousDateFilter(period: string): any {
    const now = new Date();
    
    switch (period) {
      case '1h':
        return { 
          createdAt: { 
            $gte: new Date(now.getTime() - 2 * 60 * 60 * 1000),
            $lt: new Date(now.getTime() - 60 * 60 * 1000)
          }
        };
      case '24h':
        return { 
          createdAt: { 
            $gte: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
            $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000)
          }
        };
      case '7d':
        return { 
          createdAt: { 
            $gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
            $lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        };
      case '30d':
        return { 
          createdAt: { 
            $gte: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
            $lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          }
        };
      case '90d':
        return { 
          createdAt: { 
            $gte: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
            $lt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          }
        };
      case '1y':
        return { 
          createdAt: { 
            $gte: new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000),
            $lt: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          }
        };
      case 'all':
      default:
        return { createdAt: { $lt: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) } };
    }
  }

  private calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }
}

export const adminDashboardRepository = new AdminDashboardRepository();