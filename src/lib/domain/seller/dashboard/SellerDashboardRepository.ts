import Product from "@/models/Product";
import Order from "@/models/Order";
import Review from "@/models/Review";
import User from "@/models/User";
import { 
  DashboardFetchError, 
  EarningsDataError, 
  OrderStatsError, 
  ProductStatsError, 
  ReviewStatsError 
} from "./SellerDashboardErrors";

export class SellerDashboardRepository {
  // Helper function to get date filter based on period
  private getDateFilter(period: string) {
    const now = new Date();
    let startDate: Date | null = null;

    switch (period) {
      case '30min':
        startDate = new Date(now.getTime() - 30 * 60 * 1000);
        break;
      case '1hour':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '1day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
      default:
        return {};
    }

    return startDate ? { createdAt: { $gte: startDate } } : {};
  }

  async getDashboardStats(sellerId: string, period: string = 'all') {
    try {
      // Ensure User model is registered
      if (!User) {
        console.warn('User model not loaded properly');
      }

      const dateFilter = this.getDateFilter(period);
      const productBaseQuery = { sellerId, ...dateFilter };

      // Get seller's product IDs for the filtered period
      const sellerProducts = await Product.find(productBaseQuery).select('_id').lean();
      const sellerProductIds = sellerProducts.map(p => p._id);

      const orderBaseQuery = {
        'items.productId': { $in: sellerProductIds },
        ...dateFilter
      };

      // Fetch all stats in parallel
      const [
        totalProducts,
        publishedProducts,
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        paidOrders,
        recentOrders,
      ] = await Promise.all([
        Product.countDocuments(productBaseQuery),
        Product.countDocuments({ ...productBaseQuery, isPublished: true }),
        Order.countDocuments(orderBaseQuery),
        Order.countDocuments({ ...orderBaseQuery, orderStatus: 'pending' }),
        Order.countDocuments({ ...orderBaseQuery, orderStatus: 'processing' }),
        Order.countDocuments({ ...orderBaseQuery, orderStatus: 'shipped' }),
        Order.countDocuments({ ...orderBaseQuery, orderStatus: 'delivered' }),
        Order.find({ ...orderBaseQuery, paymentStatus: 'paid' })
          .select('totalAmount orderStatus createdAt deliveredAt').lean(),
        Order.find(orderBaseQuery)
          .sort({ createdAt: -1 })
          .limit(5)
          .select('orderNumber totalAmount orderStatus createdAt userId')
          .populate('userId', 'name email')
          .lean(),
      ]);

      // Calculate revenue
      const totalRevenue = paidOrders.reduce((sum, order: any) => sum + (order.totalAmount || 0), 0);

      // Calculate completed revenue (delivered + paid for more than 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const completedRevenue = paidOrders
        .filter((order: any) =>
          order.orderStatus === 'delivered' &&
          order.deliveredAt &&
          new Date(order.deliveredAt) <= sevenDaysAgo
        )
        .reduce((sum, order: any) => sum + (order.totalAmount || 0), 0);

      return {
        products: {
          total: totalProducts,
          published: publishedProducts,
          draft: totalProducts - publishedProducts,
          pending: 0,
          approved: publishedProducts,
          rejected: 0,
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          confirmed: 0,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: 0,
          returned: 0,
        },
        revenue: {
          total: totalRevenue,
          completed: completedRevenue,
          pending: totalRevenue - completedRevenue,
        },
        recentOrders: recentOrders.map((order: any) => ({
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          customerName: order.userId?.name || order.userId?.email || 'Guest User',
          totalAmount: order.totalAmount,
          status: order.orderStatus,
          createdAt: order.createdAt,
        })),
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw new DashboardFetchError("Failed to fetch dashboard data");
    }
  }

  async getEarningsStats(sellerId: string) {
    try {
      // Get seller's product IDs
      const sellerProducts = await Product.find({ sellerId }).distinct('_id');

      // Get paid orders for earnings calculation
      const paidOrders = await Order.find({
        'items.productId': { $in: sellerProducts },
        paymentStatus: 'paid'
      }).select('totalAmount orderStatus createdAt deliveredAt').lean();

      // Calculate total revenue from paid orders
      const totalRevenue = paidOrders.reduce((sum, order: any) => sum + (order.totalAmount || 0), 0);

      // Calculate completed revenue (delivered orders older than 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const completedRevenue = paidOrders
        .filter((order: any) => 
          order.orderStatus === 'delivered' && 
          order.deliveredAt && 
          new Date(order.deliveredAt) <= sevenDaysAgo
        )
        .reduce((sum, order: any) => sum + (order.totalAmount || 0), 0);

      // Calculate pending revenue
      const pendingRevenue = totalRevenue - completedRevenue;

      // Platform fee (assuming 5% commission)
      const platformFees = totalRevenue * 0.05;

      // Calculate growth (comparing last 30 days vs previous 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const currentPeriodRevenue = paidOrders
        .filter((order: any) => new Date(order.createdAt) >= thirtyDaysAgo)
        .reduce((sum, order: any) => sum + (order.totalAmount || 0), 0);

      const previousPeriodRevenue = paidOrders
        .filter((order: any) => 
          new Date(order.createdAt) >= sixtyDaysAgo && 
          new Date(order.createdAt) < thirtyDaysAgo
        )
        .reduce((sum, order: any) => sum + (order.totalAmount || 0), 0);

      const growth = previousPeriodRevenue > 0 
        ? ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 
        : 0;

      return {
        totalRevenue,
        completedRevenue,
        pendingRevenue,
        totalPayouts: completedRevenue,
        pendingPayouts: 0,
        platformFees,
        growth: Math.round(growth * 100) / 100
      };
    } catch (error) {
      console.error("Error fetching earnings stats:", error);
      throw new EarningsDataError("Failed to fetch earnings data");
    }
  }

  async getOrderStats(sellerId: string) {
    try {
      // Get seller's product IDs
      const sellerProducts = await Product.find({ sellerId }).distinct('_id');

      // Get order stats
      const stats = await Order.aggregate([
        {
          $match: {
            'items.productId': { $in: sellerProducts }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: {
              $sum: { $cond: [{ $eq: ['$orderStatus', 'pending'] }, 1, 0] }
            },
            confirmed: {
              $sum: { $cond: [{ $eq: ['$orderStatus', 'confirmed'] }, 1, 0] }
            },
            processing: {
              $sum: { $cond: [{ $eq: ['$orderStatus', 'processing'] }, 1, 0] }
            },
            shipped: {
              $sum: { $cond: [{ $eq: ['$orderStatus', 'shipped'] }, 1, 0] }
            },
            delivered: {
              $sum: { $cond: [{ $eq: ['$orderStatus', 'delivered'] }, 1, 0] }
            },
            cancelled: {
              $sum: { $cond: [{ $eq: ['$orderStatus', 'cancelled'] }, 1, 0] }
            },
            returned: {
              $sum: { $cond: [{ $eq: ['$orderStatus', 'returned'] }, 1, 0] }
            }
          }
        }
      ]);

      return stats[0] || {
        total: 0,
        pending: 0,
        confirmed: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        returned: 0
      };
    } catch (error) {
      console.error("Error fetching order stats:", error);
      throw new OrderStatsError("Failed to fetch order statistics");
    }
  }

  async getProductStats(sellerId: string) {
    try {
      // Get product stats
      const stats = await Product.aggregate([
        { $match: { sellerId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            published: {
              $sum: { $cond: [{ $eq: ['$isPublished', true] }, 1, 0] }
            },
            draft: {
              $sum: { $cond: [{ $eq: ['$isPublished', false] }, 1, 0] }
            },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] }
            },
            approved: {
              $sum: { $cond: [{ $eq: ['$status', 'APPROVED'] }, 1, 0] }
            },
            rejected: {
              $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0] }
            },
            lowStock: {
              $sum: {
                $cond: [
                  { $and: [{ $gte: ['$inStockQuantity', 1] }, { $lte: ['$inStockQuantity', 10] }] },
                  1,
                  0
                ]
              }
            },
            outOfStock: {
              $sum: { $cond: [{ $lte: ['$inStockQuantity', 0] }, 1, 0] }
            },
            totalViews: { $sum: { $ifNull: ['$viewCount', 0] } },
            totalSold: { $sum: { $ifNull: ['$totalSold', 0] } },
            totalWishlisted: { $sum: { $ifNull: ['$wishlistCount', 0] } }
          }
        }
      ]);

      return stats[0] || {
        total: 0,
        published: 0,
        draft: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        lowStock: 0,
        outOfStock: 0,
        totalViews: 0,
        totalSold: 0,
        totalWishlisted: 0
      };
    } catch (error) {
      console.error("Error fetching product stats:", error);
      throw new ProductStatsError("Failed to fetch product statistics");
    }
  }

  async getReviewStats(sellerId: string) {
    try {
      // Get seller's product IDs
      const sellerProducts = await Product.find({ sellerId }).distinct('_id');

      // Get review stats
      const stats = await Review.aggregate([
        {
          $match: {
            productId: { $in: sellerProducts }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            approved: {
              $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
            },
            rejected: {
              $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
            },
            avgRating: { $avg: '$rating' }
          }
        }
      ]);

      const reviewStats = stats[0] || {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        avgRating: 0
      };

      // Round average rating to 1 decimal place
      reviewStats.avgRating = Math.round(reviewStats.avgRating * 10) / 10;

      return reviewStats;
    } catch (error) {
      console.error("Error fetching review stats:", error);
      throw new ReviewStatsError("Failed to fetch review statistics");
    }
  }
}

export const sellerDashboardRepository = new SellerDashboardRepository();