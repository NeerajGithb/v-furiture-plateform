import Product from "@/models/Product";
import Order from "@/models/Order";
import mongoose from "mongoose";
import { getStartDateFromPeriod } from "../../shared/dateUtils";
import { ISellerDashboardRepository } from "./ISellerDashboardRepository";

export class SellerDashboardRepository implements ISellerDashboardRepository {
  async getDashboardStats(sellerId: string, period?: string) {
    const dateFilter: any = {};
    if (period) {
      const startDate = getStartDateFromPeriod(period);
      dateFilter.createdAt = { $gte: startDate };
    }

    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
    const productBaseQuery = { sellerId: sellerObjectId, ...dateFilter };

    // Get product stats via aggregation (single query)
    const [productStats, sellerProductIds] = await Promise.all([
      Product.aggregate([
        { $match: productBaseQuery },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            published: { $sum: { $cond: ['$isPublished', 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
            approved: { $sum: { $cond: [{ $eq: ['$status', 'APPROVED'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0] } },
            lowStock: { $sum: { $cond: [{ $and: [{ $gt: ['$inStockQuantity', 0] }, { $lte: ['$inStockQuantity', 10] }] }, 1, 0] } },
            outOfStock: { $sum: { $cond: [{ $lte: ['$inStockQuantity', 0] }, 1, 0] } },
            totalViews: { $sum: { $ifNull: ['$viewCount', 0] } },
            totalSold: { $sum: { $ifNull: ['$totalSold', 0] } },
            totalWishlisted: { $sum: { $ifNull: ['$wishlistCount', 0] } },
          }
        }
      ]),
      Product.find(productBaseQuery).select('_id').lean()
    ]);

    const pStats = productStats[0] || {
      total: 0, published: 0, pending: 0, approved: 0, rejected: 0,
      lowStock: 0, outOfStock: 0, totalViews: 0, totalSold: 0, totalWishlisted: 0
    };

    const productIds = sellerProductIds.map((p: any) => p._id);

    if (productIds.length === 0) {
      return {
        products: { ...pStats, draft: 0 },
        orders: { total: 0, pending: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0, returned: 0 },
        revenue: { total: 0, completed: 0, pending: 0, growth: 0 },
        recentOrders: [],
      };
    }

    const orderBaseQuery = { 'items.productId': { $in: productIds }, ...dateFilter };

    // Calculate previous period for growth
    let prevRevenue = 0;
    if (period) {
      const currentStart = getStartDateFromPeriod(period);
      const periodMs = Date.now() - currentStart.getTime();
      const prevStart = new Date(currentStart.getTime() - periodMs);
      const prevOrders = await Order.aggregate([
        { $match: { 'items.productId': { $in: productIds }, createdAt: { $gte: prevStart, $lt: currentStart }, paymentStatus: 'paid', orderStatus: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);
      prevRevenue = prevOrders[0]?.total || 0;
    }

    const [orderStats, paidOrders, recentOrders] = await Promise.all([
      Order.aggregate([
        { $match: orderBaseQuery },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: { $sum: { $cond: [{ $eq: ['$orderStatus', 'pending'] }, 1, 0] } },
            confirmed: { $sum: { $cond: [{ $eq: ['$orderStatus', 'confirmed'] }, 1, 0] } },
            processing: { $sum: { $cond: [{ $eq: ['$orderStatus', 'processing'] }, 1, 0] } },
            shipped: { $sum: { $cond: [{ $eq: ['$orderStatus', 'shipped'] }, 1, 0] } },
            delivered: { $sum: { $cond: [{ $eq: ['$orderStatus', 'delivered'] }, 1, 0] } },
            cancelled: { $sum: { $cond: [{ $eq: ['$orderStatus', 'cancelled'] }, 1, 0] } },
            returned: { $sum: { $cond: [{ $eq: ['$orderStatus', 'returned'] }, 1, 0] } },
          }
        }
      ]),
      Order.find({ ...orderBaseQuery, paymentStatus: 'paid', orderStatus: 'delivered' })
        .select('totalAmount deliveredAt').lean(),
      Order.find(orderBaseQuery)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('orderNumber totalAmount orderStatus createdAt userId')
        .populate('userId', 'name email')
        .lean(),
    ]);

    const oStats = orderStats[0] || { total: 0, pending: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0, returned: 0 };
    const totalRevenue = paidOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const completedRevenue = paidOrders
      .filter((o: any) => o.deliveredAt && new Date(o.deliveredAt) <= sevenDaysAgo)
      .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

    const growth = prevRevenue > 0
      ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100 * 10) / 10
      : totalRevenue > 0 ? 100 : 0;

    return {
      products: {
        total: pStats.total,
        published: pStats.published,
        draft: pStats.total - pStats.published,
        pending: pStats.pending,
        approved: pStats.approved,
        rejected: pStats.rejected,
        lowStock: pStats.lowStock,
        outOfStock: pStats.outOfStock,
        totalViews: pStats.totalViews,
        totalSold: pStats.totalSold,
        totalWishlisted: pStats.totalWishlisted,
      },
      orders: {
        total: oStats.total,
        pending: oStats.pending,
        confirmed: oStats.confirmed,
        processing: oStats.processing,
        shipped: oStats.shipped,
        delivered: oStats.delivered,
        cancelled: oStats.cancelled,
        returned: oStats.returned,
      },
      revenue: {
        total: totalRevenue,
        completed: completedRevenue,
        pending: totalRevenue - completedRevenue,
        growth,
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
