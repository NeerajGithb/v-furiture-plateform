import { IAdminOrdersRepository, AdminOrder, OrderStats, OrderTrend } from "./IAdminOrdersRepository";
import { AdminOrdersQueryRequest, OrderStatus, PaymentStatus } from "./AdminOrdersSchemas";
import { PaginationResult } from "../../shared/types";
import { RepositoryError } from "../../shared/InfrastructureError";
import Order from "@/models/Order";

export class AdminOrdersRepository implements IAdminOrdersRepository {
  async findById(id: string): Promise<AdminOrder | null> {
    try {
      const order = await Order.findById(id)
        .populate("userId", "name email")
        .populate("items.productId", "name")
        .lean();

      return order ? this.mapToAdminOrder(order) : null;
    } catch (error) {
      throw new RepositoryError("Failed to find order by ID", "findById", error as Error);
    }
  }

  async findByOrderNumber(orderNumber: string): Promise<AdminOrder | null> {
    try {
      const order = await Order.findOne({ orderNumber })
        .populate("userId", "name email")
        .populate("items.productId", "name")
        .lean();

      return order ? this.mapToAdminOrder(order) : null;
    } catch (error) {
      throw new RepositoryError("Failed to find order by order number", "findByOrderNumber", error as Error);
    }
  }

  async findMany(query: AdminOrdersQueryRequest): Promise<PaginationResult<AdminOrder>> {
    try {
      const { 
        page, limit, search, orderStatus, paymentStatus, sellerId, userId, 
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
      
      if (startDate || endDate) {
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
          .populate("items.productId", "name")
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
    } catch (error) {
      throw new RepositoryError("Failed to find orders", "findMany", error as Error);
    }
  }

  async getStats(period: string): Promise<OrderStats> {
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "1y":
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const [
        statusStats,
        paymentStats,
        revenueStats,
        recentOrders
      ] = await Promise.all([
        Order.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: "$orderStatus",
              count: { $sum: 1 },
              revenue: { $sum: "$totalAmount" }
            }
          }
        ]),
        Order.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: "$paymentStatus",
              count: { $sum: 1 },
              revenue: { $sum: "$totalAmount" }
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
                  $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalAmount", 0]
                }
              },
              pendingRevenue: {
                $sum: {
                  $cond: [{ $eq: ["$paymentStatus", "pending"] }, "$totalAmount", 0]
                }
              }
            }
          }
        ]),
        Order.find({ createdAt: { $gte: startDate } })
          .populate("userId", "name")
          .sort({ createdAt: -1 })
          .limit(10)
          .select("orderNumber userId totalAmount orderStatus createdAt")
          .lean()
      ]);

      const stats = revenueStats[0] || { total: 0, totalRevenue: 0, paidRevenue: 0, pendingRevenue: 0 };
      const avgOrderValue = stats.total > 0 ? stats.totalRevenue / stats.total : 0;

      // Count by status
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
        byStatus: statusStats.map((stat: any) => ({
          status: stat._id,
          count: stat.count,
          revenue: stat.revenue,
        })),
        byPaymentStatus: paymentStats.map((stat: any) => ({
          status: stat._id,
          count: stat.count,
          revenue: stat.revenue,
        })),
        recentOrders: recentOrders.map((order: any) => ({
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          customerName: order.userId?.name || "Unknown",
          totalAmount: order.totalAmount,
          status: order.orderStatus,
          createdAt: order.createdAt,
        })),
      };
    } catch (error) {
      throw new RepositoryError("Failed to get order stats", "getStats", error as Error);
    }
  }

  async getTrends(startDate: Date, endDate: Date, groupBy: string): Promise<OrderTrend[]> {
    try {
      const groupStage = this.buildGroupStage(groupBy);
      
      const trends = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: groupStage,
            orders: { $sum: 1 },
            revenue: { $sum: "$totalAmount" }
          }
        },
        {
          $addFields: {
            avgOrderValue: { $divide: ["$revenue", "$orders"] }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      return trends.map((trend: any) => ({
        date: this.formatDateFromGroup(trend._id, groupBy),
        orders: trend.orders,
        revenue: trend.revenue,
        avgOrderValue: trend.avgOrderValue,
      }));
    } catch (error) {
      throw new RepositoryError("Failed to get order trends", "getTrends", error as Error);
    }
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, notes?: string): Promise<AdminOrder> {
    try {
      const updateData: any = { orderStatus: status, updatedAt: new Date() };
      if (notes) updateData.notes = notes;
      if (status === "delivered") updateData.deliveredAt = new Date();

      const order = await Order.findByIdAndUpdate(
        orderId,
        updateData,
        { new: true, runValidators: true }
      )
        .populate("userId", "name email")
        .populate("items.productId", "name");

      if (!order) {
        throw new Error("Order not found");
      }

      return this.mapToAdminOrder(order.toObject());
    } catch (error) {
      throw new RepositoryError("Failed to update order status", "updateOrderStatus", error as Error);
    }
  }

  async updatePaymentStatus(orderId: string, status: PaymentStatus, notes?: string): Promise<AdminOrder> {
    try {
      const updateData: any = { paymentStatus: status, updatedAt: new Date() };
      if (notes) updateData.notes = notes;

      const order = await Order.findByIdAndUpdate(
        orderId,
        updateData,
        { new: true, runValidators: true }
      )
        .populate("userId", "name email")
        .populate("items.productId", "name");

      if (!order) {
        throw new Error("Order not found");
      }

      return this.mapToAdminOrder(order.toObject());
    } catch (error) {
      throw new RepositoryError("Failed to update payment status", "updatePaymentStatus", error as Error);
    }
  }

  async addTrackingNumber(orderId: string, trackingNumber: string): Promise<AdminOrder> {
    try {
      const order = await Order.findByIdAndUpdate(
        orderId,
        { trackingNumber, updatedAt: new Date() },
        { new: true, runValidators: true }
      )
        .populate("userId", "name email")
        .populate("items.productId", "name");

      if (!order) {
        throw new Error("Order not found");
      }

      return this.mapToAdminOrder(order.toObject());
    } catch (error) {
      throw new RepositoryError("Failed to add tracking number", "addTrackingNumber", error as Error);
    }
  }

  async updateEstimatedDelivery(orderId: string, estimatedDelivery: Date): Promise<AdminOrder> {
    try {
      const order = await Order.findByIdAndUpdate(
        orderId,
        { estimatedDelivery, updatedAt: new Date() },
        { new: true, runValidators: true }
      )
        .populate("userId", "name email")
        .populate("items.productId", "name");

      if (!order) {
        throw new Error("Order not found");
      }

      return this.mapToAdminOrder(order.toObject());
    } catch (error) {
      throw new RepositoryError("Failed to update estimated delivery", "updateEstimatedDelivery", error as Error);
    }
  }

  async exportOrders(query: AdminOrdersQueryRequest): Promise<AdminOrder[]> {
    try {
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
        .populate("items.productId", "name")
        .sort({ createdAt: -1 })
        .lean();

      return orders.map(order => this.mapToAdminOrder(order));
    } catch (error) {
      throw new RepositoryError("Failed to export orders", "exportOrders", error as Error);
    }
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
        productId: item.productId?._id?.toString() || item.productId?.id || item.productId,
        productName: item.productId?.name || item.productName || "",
        quantity: item.quantity || 0,
        price: item.price || 0,
        sellerId: item.sellerId?.toString() || "",
        sellerName: item.sellerName || "",
      })),
      totalAmount: order.totalAmount || 0,
      orderStatus: order.orderStatus || "pending",
      paymentStatus: order.paymentStatus || "pending",
      paymentMethod: order.paymentMethod || "",
      shippingAddress: order.shippingAddress || {},
      billingAddress: order.billingAddress,
      notes: order.notes,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      deliveredAt: order.deliveredAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private buildGroupStage(groupBy: string) {
    switch (groupBy) {
      case "day":
        return {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" }
        };
      case "week":
        return {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" }
        };
      case "month":
        return {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        };
      default:
        return {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" }
        };
    }
  }

  private formatDateFromGroup(group: any, groupBy: string): string {
    switch (groupBy) {
      case "day":
        return `${group.year}-${String(group.month).padStart(2, '0')}-${String(group.day).padStart(2, '0')}`;
      case "week":
        return `${group.year}-W${String(group.week).padStart(2, '0')}`;
      case "month":
        return `${group.year}-${String(group.month).padStart(2, '0')}`;
      default:
        return `${group.year}-${String(group.month).padStart(2, '0')}-${String(group.day).padStart(2, '0')}`;
    }
  }
}