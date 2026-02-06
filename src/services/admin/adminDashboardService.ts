import { BasePrivateService } from "../baseService";
import { 
  AdminDashboardStats, 
  DashboardApiResponse,
  TopSellingProduct,
  UserActivity,
  TopSeller,
  RecentOrderRaw
} from "@/types/admin";

interface DashboardQuery {
  period?: string;
}

class AdminDashboardService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  async getDashboardData(params: DashboardQuery = {}): Promise<AdminDashboardStats> {
    const response = await this.get<DashboardApiResponse>("/admin/dashboard", params);

    if (response.success && response.data) {
      const data = response.data;
      
      return {
        period: data.period,
        revenue: {
          total: data.overview.totalRevenue,
          completed: data.overview.totalRevenue,
          pending: 0,
          avgOrderValue: data.overview.avgOrderValue,
          growth: data.overview.revenueGrowth,
        },
        orders: {
          total: data.overview.totalOrders,
          pending: data.orders?.pendingOrders || 0,
          processing: data.orders?.processingOrders || 0,
          shipped: 0,
          delivered: data.orders?.completedOrders || 0,
          cancelled: data.orders?.cancelledOrders || 0,
        },
        users: {
          total: data.overview.totalUsers,
          verified: data.users?.activeUsers || 0,
          unverified: data.users?.newUsers || 0,
          uniqueCustomers: data.overview.totalUsers,
        },
        products: {
          total: data.overview.totalProducts,
          published: data.products?.publishedProducts || 0,
          draft: data.products?.pendingProducts || 0,
          lowStock: 0,
          outOfStock: data.products?.outOfStockProducts || 0,
        },
        sellers: {
          total: data.overview.totalSellers,
          active: data.sellers?.activeSellers || 0,
          pending: data.sellers?.pendingSellers || 0,
          suspended: 0,
          verified: data.sellers?.verifiedSellers || 0,
        },
        engagement: {
          totalAddedToCart: 0,
          totalAddedToWishlist: 0,
          cartAbandonmentRate: 0,
          conversionRate: data.overview.conversionRate,
        },
        reviews: {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
        },
        categories: {
          total: 0,
        },
        search: {
          totalSearches: 0,
          uniqueQueries: 0,
          topSearches: [],
        },
        paymentMethods: {},
        growth: {
          revenue: data.overview.revenueGrowth,
          orders: data.overview.ordersGrowth,
          users: data.overview.usersGrowth,
        },
        topProducts: {
          mostViewed: data.sales?.topSellingProducts?.map((p: TopSellingProduct) => ({
            id: p.id,
            name: p.name,
            viewCount: p.quantity,
            price: p.revenue / p.quantity || 0,
          })) || [],
          bestSellers: data.sales?.topSellingProducts?.map((p: TopSellingProduct) => ({
            id: p.id,
            name: p.name,
            totalSold: p.quantity,
            price: p.revenue / p.quantity || 0,
          })) || [],
          mostWishlisted: [],
        },
        recentActivity: {
          users: data.users?.userActivity?.slice(0, 5)?.map((u: UserActivity) => ({
            id: u.date,
            name: `${u.newUsers} new users`,
            email: '',
            verified: true,
            createdAt: new Date(u.date),
          })) || [],
          sellers: data.sellers?.topSellers?.slice(0, 5)?.map((s: TopSeller) => ({
            id: s.id,
            businessName: s.name,
            email: '',
            status: 'active',
            createdAt: new Date(),
          })) || [],
          orders: data.orders?.recentOrders?.slice(0, 5)?.map((o: RecentOrderRaw) => ({
            id: o.id,
            orderId: o.orderNumber,
            customerName: o.customerName,
            totalAmount: o.amount,
            status: o.status,
            createdAt: new Date(o.createdAt),
          })) || [],
        },
      };
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch dashboard data.",
      );
    }
  }
}

export default new AdminDashboardService();