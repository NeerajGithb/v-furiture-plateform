import { IAdminOrdersRepository, AdminOrder, OrderStats } from "./IAdminOrdersRepository";
import { AdminOrdersQueryRequest, OrderStatus, PaymentStatus } from "./AdminOrdersSchemas";
import { PaginationResult } from "../../shared/types";
import { getStartDateFromPeriod } from "../../shared/dateUtils";
import Order from "@/models/Order";

export class AdminOrdersRepository implements IAdminOrdersRepository {
  async findMany(query: AdminOrdersQueryRequest): Promise<PaginationResult<AdminOrder>> {
      const {
        period, page, limit, search, orderStatus, paymentStatus, sellerId, userId,
        startDate, endDate, sortBy, sortOrder, minAmount, maxAmount
      } = query;

      // Build filter
      const filter: any = {};

      if (search) {
        filter.$or = [
          { orderNumber: { $regex: search, $options: "i" } },
          { "shippingAddress.fullName": { $regex: search, $options: "i" } },
          { "shippingAddress.phone": { $regex: search, $options: "i" } },
        ];
      }

      if (orderStatus) filter.orderStatus = orderStatus;
      if (paymentStatus) filter.paymentStatus = paymentStatus;
      if (sellerId) filter["items.sellerId"] = sellerId;
      if (userId) filter.userId = userId;

      // Handle period filter
      if (period) {
        const periodStartDate = getStartDateFromPeriod(period);
        filter.createdAt = { $gte: periodStartDate };
      } else if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }

      if (minAmount !== undefined || maxAmount !== undefined) {
        filter.totalAmount = {};
        if (minAmount !== undefined) filter.totalAmount.$gte = minAmount;
        if (maxAmount !== undefined) filter.totalAmount.$lte = maxAmount;
      }

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;

      // Execute queries
      const [orders, total] = await Promise.all([
        Order.find(filter)
          .populate("userId", "name email")
          .populate({
            path: "items.productId",
            select: "name sku mainImage"
          })
          .populate({
            path: "items.sellerId",
            select: "businessName email"
          })
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Order.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: orders.map(order => this.mapToAdminOrder(order)),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
  }

  async getStats(period: string): Promise<OrderStats> {
      const startDate = getStartDateFromPeriod(period);

      const [
        statusStats,
        revenueStats
      ] = await Promise.all([
        Order.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: "$orderStatus",
              count: { $sum: 1 }
            }
          }
        ]),
        Order.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              totalRevenue: { $sum: "$totalAmount" },
              paidRevenue: {
                $sum: {
                  $cond: [
                    { $and: [
                      { $eq: ["$paymentStatus", "paid"] },
                      { $eq: ["$orderStatus", "delivered"] }
                    ]},
                    "$totalAmount",
                    0
                  ]
                }
              },
              pendingRevenue: {
                $sum: {
                  $cond: [{ $eq: ["$paymentStatus", "pending"] }, "$totalAmount", 0]
                }
              }
            }
          }
        ])
      ]);

      const stats = revenueStats[0] || { total: 0, totalRevenue: 0, paidRevenue: 0, pendingRevenue: 0 };
      const avgOrderValue = stats.total > 0 ? stats.totalRevenue / stats.total : 0;

      const statusCounts = {
        pending: 0, confirmed: 0, processing: 0, shipped: 0,
        delivered: 0, cancelled: 0, returned: 0
      };

      statusStats.forEach((stat: any) => {
        if (stat._id in statusCounts) {
          statusCounts[stat._id as keyof typeof statusCounts] = stat.count;
        }
      });

      return {
        total: stats.total,
        pending: statusCounts.pending,
        confirmed: statusCounts.confirmed,
        processing: statusCounts.processing,
        shipped: statusCounts.shipped,
        delivered: statusCounts.delivered,
        cancelled: statusCounts.cancelled,
        returned: statusCounts.returned,
        totalRevenue: stats.totalRevenue,
        paidRevenue: stats.paidRevenue,
        pendingRevenue: stats.pendingRevenue,
        avgOrderValue,
      };
  }

  async exportOrders(query: AdminOrdersQueryRequest): Promise<AdminOrder[]> {
      // Use the same filter logic but without pagination
      const { search, orderStatus, paymentStatus, sellerId, userId, startDate, endDate } = query;

      const filter: any = {};

      if (search) {
        filter.$or = [
          { orderNumber: { $regex: search, $options: "i" } },
          { "shippingAddress.fullName": { $regex: search, $options: "i" } },
        ];
      }

      if (orderStatus) filter.orderStatus = orderStatus;
      if (paymentStatus) filter.paymentStatus = paymentStatus;
      if (sellerId) filter["items.sellerId"] = sellerId;
      if (userId) filter.userId = userId;

      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }

      const orders = await Order.find(filter)
        .populate("userId", "name email")
        .populate({
          path: "items.productId",
          select: "name sku mainImage"
        })
        .populate({
          path: "items.sellerId",
          select: "businessName email"
        })
        .sort({ createdAt: -1 })
        .lean();

      return orders.map(order => this.mapToAdminOrder(order));
  }

  private mapToAdminOrder(order: any): AdminOrder {
    return {
      id: order._id?.toString() || order.id,
      orderNumber: order.orderNumber,
      userId: {
        id: order.userId?._id?.toString() || order.userId?.id || order.userId,
        name: order.userId?.name || "",
        email: order.userId?.email || "",
      },
      items: (order.items || []).map((item: any) => ({
        productId: {
          id: item.productId?._id?.toString() || item.productId?.id || item.productId,
          name: item.productId?.name || item.name || "",
          sku: item.productId?.sku || item.selectedVariant?.sku || "",
          mainImage: item.productId?.mainImage || item.productImage ? {
            url: item.productId?.mainImage?.url || item.productId?.mainImage || item.productImage || "",
            alt: item.productId?.mainImage?.alt || item.productId?.name || item.name || ""
          } : undefined
        },
        quantity: item.quantity || 0,
        price: item.price || 0,
        sellerId: {
          id: item.sellerId?._id?.toString() || item.sellerId?.id || item.sellerId?.toString() || "",
          businessName: item.sellerId?.businessName || "",
          email: item.sellerId?.email || ""
        }
      })),
      totalAmount: order.totalAmount || 0,
      orderStatus: order.orderStatus || "pending",
      paymentStatus: order.paymentStatus || "pending",
      paymentMethod: order.paymentMethod || "",
      shippingAddress: {
        fullName: order.shippingAddress?.fullName || "",
        phone: order.shippingAddress?.phone || "",
        addressLine1: order.shippingAddress?.addressLine1 || "",
        addressLine2: order.shippingAddress?.addressLine2,
        city: order.shippingAddress?.city || "",
        state: order.shippingAddress?.state || "",
        postalCode: order.shippingAddress?.postalCode || "",
        country: order.shippingAddress?.country || "India"
      },
      billingAddress: order.billingAddress,
      priceBreakdown: {
        subtotal: order.subtotal || 0,
        couponDiscount: order.discount || 0,
        shipping: order.shippingCost || 0,
        tax: order.tax || 0,
        total: order.totalAmount || 0
      },
      notes: order.notes,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.expectedDeliveryDate,
      deliveredAt: order.deliveredAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
