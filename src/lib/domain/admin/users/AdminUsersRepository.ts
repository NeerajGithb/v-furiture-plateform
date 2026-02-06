import { IAdminUsersRepository, AdminUser, UserStats } from "./IAdminUsersRepository";
import { AdminUsersQueryRequest, UserStatus } from "./AdminUsersSchemas";
import { PaginationResult } from "../../shared/types";
import { RepositoryError } from "../../shared/InfrastructureError";
import User from "@/models/User";
import Order from "@/models/Order";

export class AdminUsersRepository implements IAdminUsersRepository {
  async findById(id: string): Promise<AdminUser | null> {
    try {
      const user = await User.findById(id).lean();
      return user ? this.mapToAdminUser(user) : null;
    } catch (error) {
      throw new RepositoryError("Failed to find user by ID", "findById", error as Error);
    }
  }

  async findMany(query: AdminUsersQueryRequest): Promise<PaginationResult<AdminUser>> {
    try {
      const { 
        page, limit, search, status, emailVerified, 
        startDate, endDate, sortBy, sortOrder 
      } = query;
      
      // Build filter
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
      
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;

      // Execute queries
      const [users, total] = await Promise.all([
        User.find(filter)
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        User.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);

      // Enrich users with order data
      const enrichedUsers = await Promise.all(
        users.map(async (user) => {
          const orderStats = await Order.aggregate([
            { $match: { userId: user._id } },
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
            ...user,
            totalOrders: stats.totalOrders,
            totalSpent: stats.totalSpent,
            lastOrderDate: stats.lastOrderDate,
          };
        })
      );

      return {
        data: enrichedUsers.map(user => this.mapToAdminUser(user)),
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
      throw new RepositoryError("Failed to find users", "findMany", error as Error);
    }
  }

  async getStats(period: string): Promise<UserStats> {
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
        verificationStats,
        orderStats,
        registrationStats,
        recentUsers
      ] = await Promise.all([
        User.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 }
            }
          }
        ]),
        User.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              verified: { $sum: { $cond: ["$emailVerified", 1, 0] } },
              unverified: { $sum: { $cond: ["$emailVerified", 0, 1] } }
            }
          }
        ]),
        Order.aggregate([
          {
            $lookup: {
              from: "users",
              localField: "userId",
              foreignField: "_id",
              as: "user"
            }
          },
          { $unwind: "$user" },
          { $match: { "user.createdAt": { $gte: startDate } } },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalSpent: { $sum: "$totalAmount" },
              uniqueUsers: { $addToSet: "$userId" }
            }
          },
          {
            $addFields: {
              uniqueUserCount: { $size: "$uniqueUsers" }
            }
          }
        ]),
        User.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: "$registrationSource",
              count: { $sum: 1 }
            }
          }
        ]),
        User.find({ createdAt: { $gte: startDate } })
          .sort({ createdAt: -1 })
          .limit(10)
          .select("name email status createdAt")
          .lean()
      ]);

      const verification = verificationStats[0] || { total: 0, verified: 0, unverified: 0 };
      const orders = orderStats[0] || { totalOrders: 0, totalSpent: 0, uniqueUserCount: 0 };

      // Count by status
      const statusCounts = {
        active: 0, inactive: 0, suspended: 0, banned: 0
      };

      statusStats.forEach((stat: any) => {
        if (stat._id in statusCounts) {
          statusCounts[stat._id as keyof typeof statusCounts] = stat.count;
        }
      });

      return {
        total: verification.total,
        active: statusCounts.active,
        inactive: statusCounts.inactive,
        suspended: statusCounts.suspended,
        banned: statusCounts.banned,
        verified: verification.verified,
        unverified: verification.unverified,
        newUsers: verification.total,
        returningUsers: orders.uniqueUserCount,
        totalOrders: orders.totalOrders,
        totalSpent: orders.totalSpent,
        avgOrdersPerUser: orders.uniqueUserCount > 0 ? orders.totalOrders / orders.uniqueUserCount : 0,
        avgSpentPerUser: orders.uniqueUserCount > 0 ? orders.totalSpent / orders.uniqueUserCount : 0,
        byRegistrationSource: registrationStats.map((stat: any) => ({
          source: stat._id || "direct",
          count: stat.count,
        })),
        recentUsers: recentUsers.map((user: any) => ({
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          status: user.status || "active",
          createdAt: user.createdAt,
        })),
      };
    } catch (error) {
      throw new RepositoryError("Failed to get user stats", "getStats", error as Error);
    }
  }

  async updateStatus(userId: string, status: UserStatus, reason?: string): Promise<AdminUser> {
    try {
      const updateData: any = { status, updatedAt: new Date() };
      if (reason) updateData.notes = reason;

      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new Error("User not found");
      }

      return this.mapToAdminUser(user.toObject());
    } catch (error) {
      throw new RepositoryError("Failed to update user status", "updateStatus", error as Error);
    }
  }

  async addNote(userId: string, note: string): Promise<AdminUser> {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { 
          $push: { notes: { note, createdAt: new Date() } },
          updatedAt: new Date() 
        },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new Error("User not found");
      }

      return this.mapToAdminUser(user.toObject());
    } catch (error) {
      throw new RepositoryError("Failed to add note", "addNote", error as Error);
    }
  }

  async getOrderHistory(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const orders = await Order.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("orderNumber totalAmount orderStatus paymentStatus createdAt")
        .lean();

      return orders;
    } catch (error) {
      throw new RepositoryError("Failed to get order history", "getOrderHistory", error as Error);
    }
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