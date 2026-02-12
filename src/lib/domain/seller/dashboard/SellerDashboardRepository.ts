import Product from "@/models/Product";
import Order from "@/models/Order";
import { getStartDateFromPeriod } from "../../shared/dateUtils";
import { ISellerDashboardRepository } from "./ISellerDashboardRepository";

export class SellerDashboardRepository implements ISellerDashboardRepository {
  async getDashboardStats(sellerId: string, period?: string) {
    const dateFilter: any = {};
    if (period) {
      const startDate = getStartDateFromPeriod(period);
      dateFilter.createdAt = { $gte: startDate };
    }

    const productBaseQuery = { sellerId, ...dateFilter };

    const sellerProducts = await Product.find(productBaseQuery).select('_id').lean();
    const sellerProductIds = sellerProducts.map(p => p._id);

    const orderBaseQuery = {
      'items.productId': { $in: sellerProductIds },
      ...dateFilter
    };

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
      Order.find({ ...orderBaseQuery, paymentStatus: 'paid', orderStatus: 'delivered' })
        .select('totalAmount orderStatus createdAt deliveredAt').lean(),
      Order.find(orderBaseQuery)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('orderNumber totalAmount orderStatus createdAt userId')
        .populate('userId', 'name email')
        .lean(),
    ]);

    const totalRevenue = paidOrders.reduce((sum, order: any) => sum + (order.totalAmount || 0), 0);

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
        lowStock: 0,
        outOfStock: 0,
        totalViews: 0,
        totalSold: 0,
        totalWishlisted: 0,
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
        growth: 0,
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
  }

}

export const sellerDashboardRepository = new SellerDashboardRepository();
