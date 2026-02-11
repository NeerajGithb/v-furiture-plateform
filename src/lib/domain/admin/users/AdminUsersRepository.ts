import { IAdminUsersRepository, AdminUser, UserStats, UserDetails } from "./IAdminUsersRepository";
import { AdminUsersQueryRequest } from "./AdminUsersSchemas";
import { PaginationResult } from "../../shared/types";
import { getStartDateFromPeriod } from "../../shared/dateUtils";
import User from "@/models/User";
import Order from "@/models/Order";

export class AdminUsersRepository implements IAdminUsersRepository {
  async findMany(query: AdminUsersQueryRequest): Promise<PaginationResult<AdminUser>> {
    const {
      page, limit, search, status, emailVerified,
      startDate, endDate, sortBy, sortOrder, period
    } = query;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (status) filter.status = status;
    if (emailVerified !== undefined) filter.emailVerified = emailVerified;

    if (period) {
      const periodStartDate = getStartDateFromPeriod(period);
      filter.createdAt = { $gte: periodStartDate };
    } else if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users.map(user => this.mapToAdminUser(user)),
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

  async getStats(period?: string): Promise<UserStats> {
    const filter: any = {};

    if (period) {
      const periodStartDate = getStartDateFromPeriod(period);
      filter.createdAt = { $gte: periodStartDate };
    }

    const stats = await User.aggregate([
      { $match: filter },
      {
        $facet: {
          total: [{ $count: "count" }],
          active: [{ $match: { status: "active" } }, { $count: "count" }],
          suspended: [{ $match: { status: "suspended" } }, { $count: "count" }],
          verified: [{ $match: { emailVerified: true } }, { $count: "count" }]
        }
      }
    ]);

    const statsData = stats[0];
    return {
      total: statsData.total[0]?.count || 0,
      active: statsData.active[0]?.count || 0,
      suspended: statsData.suspended[0]?.count || 0,
      verified: statsData.verified[0]?.count || 0
    };
  }

  async findById(id: string): Promise<UserDetails | null> {
    const [user, orders] = await Promise.all([
      User.findById(id).lean(),
      Order.find({ userId: id })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("orderNumber totalAmount orderStatus paymentStatus createdAt")
        .lean()
    ]);

    if (!user) return null;

    const orderStats = await Order.aggregate([
      { $match: { userId: (user as any)._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
          lastOrderDate: { $max: "$createdAt" }
        }
      }
    ]);

    const stats = orderStats[0] || { totalOrders: 0, totalSpent: 0, lastOrderDate: null };

    return {
      ...this.mapToAdminUser({
        ...user,
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
        lastOrderDate: stats.lastOrderDate,
      }),
      orders: orders.map((order: any) => ({
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt
      }))
    };
  }

  private mapToAdminUser(user: any): AdminUser {
    return {
      id: user._id?.toString() || user.id,
      name: user.name || "",
      email: user.email || "",
      emailVerified: user.emailVerified || false,
      status: user.status || "active",
      phone: user.phone,
      avatar: user.avatar,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      addresses: (user.addresses || []).map((addr: any) => ({
        id: addr._id?.toString() || addr.id,
        type: addr.type || "home",
        fullName: addr.fullName || "",
        phone: addr.phone || "",
        address: addr.address || "",
        city: addr.city || "",
        state: addr.state || "",
        zipCode: addr.zipCode || "",
        country: addr.country || "",
        isDefault: addr.isDefault || false,
      })),
      totalOrders: user.totalOrders || 0,
      totalSpent: user.totalSpent || 0,
      lastLogin: user.lastLogin,
      lastOrderDate: user.lastOrderDate,
      registrationSource: user.registrationSource || "direct",
      notes: user.notes,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
