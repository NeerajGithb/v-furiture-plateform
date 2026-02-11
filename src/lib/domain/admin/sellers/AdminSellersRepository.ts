import { IAdminSellersRepository, AdminSeller, SellerStats } from "./IAdminSellersRepository";
import { AdminSellersQueryRequest, SellerStatus } from "./AdminSellersSchemas";
import { PaginationResult } from "../../shared/types";
import { getStartDateFromPeriod } from "../../shared/dateUtils";
import Seller from "@/models/Seller";
import Order from "@/models/Order";

export class AdminSellersRepository implements IAdminSellersRepository {
  async findById(id: string): Promise<AdminSeller | null> {
      const seller = await Seller.findById(id).lean();
      return seller ? this.mapToAdminSeller(seller) : null;
  }

  async findMany(query: AdminSellersQueryRequest): Promise<PaginationResult<AdminSeller>> {
      const { 
        page, limit, search, status, verified, period,
        startDate, endDate, sortBy, sortOrder 
      } = query;
      
      const filter: any = {};
      
      if (search) {
        filter.$or = [
          { businessName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { contactPerson: { $regex: search, $options: "i" } },
        ];
      }
      
      if (status) filter.status = status;
      if (verified !== undefined) filter.verified = verified;
      
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

      const [sellers, total] = await Promise.all([
        Seller.find(filter)
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Seller.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);

      const enrichedSellers = await Promise.all(
        sellers.map(async (seller) => {
          const orderStats = await Order.aggregate([
            { $match: { sellerId: seller._id } },
            {
              $group: {
                _id: null,
                totalSales: { $sum: 1 },
                revenue: { $sum: "$totalAmount" }
              }
            }
          ]);

          const stats = orderStats[0] || { totalSales: 0, revenue: 0 };
          
          return {
            ...seller,
            totalSales: stats.totalSales,
            revenue: stats.revenue,
          };
        })
      );

      return {
        data: enrichedSellers.map(seller => this.mapToAdminSeller(seller)),
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

  async getStats(period: string): Promise<SellerStats> {
      const dateFilter = period ? getStartDateFromPeriod(period) : null;
      const dateMatch = dateFilter ? { createdAt: { $gte: dateFilter } } : {};

      const [
        allStatusStats,
        allVerificationStats,
        revenueStats,
        recentSellers
      ] = await Promise.all([
        Seller.aggregate([
          { $match: dateMatch },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 }
            }
          }
        ]),
        Seller.aggregate([
          { $match: dateMatch },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              verified: { $sum: { $cond: ["$verified", 1, 0] } },
              unverified: { $sum: { $cond: ["$verified", 0, 1] } }
            }
          }
        ]),
        Order.aggregate([
          ...(dateFilter ? [{ $match: { createdAt: { $gte: dateFilter } } }] : []),
          {
            $lookup: {
              from: "sellers",
              localField: "sellerId",
              foreignField: "_id",
              as: "seller"
            }
          },
          { $unwind: "$seller" },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$totalAmount" },
              totalCommission: { $sum: { $multiply: ["$totalAmount", { $divide: ["$seller.commission", 100] }] } }
            }
          }
        ]),
        Seller.find(dateMatch)
          .sort({ createdAt: -1 })
          .limit(10)
          .select("businessName email status createdAt")
          .lean()
      ]);

      const verification = allVerificationStats[0] || { total: 0, verified: 0, unverified: 0 };
      const revenue = revenueStats[0] || { totalRevenue: 0, totalCommission: 0 };

      const statusCounts = {
        active: 0, pending: 0, suspended: 0, inactive: 0
      };

      allStatusStats.forEach((stat: any) => {
        if (stat._id in statusCounts) {
          statusCounts[stat._id as keyof typeof statusCounts] = stat.count;
        }
      });

      const avgRating = await Seller.aggregate([
        { $match: { rating: { $exists: true, $gt: 0 } } },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } }
      ]);

      return {
        total: verification.total,
        active: statusCounts.active,
        pending: statusCounts.pending,
        suspended: statusCounts.suspended,
        inactive: statusCounts.inactive,
        verified: verification.verified,
        unverified: verification.unverified,
        totalRevenue: revenue.totalRevenue,
        totalCommission: revenue.totalCommission,
        avgRating: avgRating[0]?.avgRating || 0,
        recentSellers: recentSellers.map((seller: any) => ({
          id: seller._id.toString(),
          businessName: seller.businessName,
          email: seller.email,
          status: seller.status || "pending",
          createdAt: seller.createdAt,
        })),
      };
  }

  async updateStatus(sellerId: string, status: SellerStatus, reason?: string): Promise<AdminSeller> {
      const updateData: any = { status, updatedAt: new Date() };
      if (reason) updateData.statusReason = reason;

      const seller = await Seller.findByIdAndUpdate(
        sellerId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!seller) {
        throw new Error("Seller not found");
      }

      return this.mapToAdminSeller(seller.toObject());
  }

  async updateVerification(sellerId: string, verified: boolean): Promise<AdminSeller> {
      const seller = await Seller.findByIdAndUpdate(
        sellerId,
        { verified, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!seller) {
        throw new Error("Seller not found");
      }

      return this.mapToAdminSeller(seller.toObject());
  }

  private mapToAdminSeller(seller: any): AdminSeller {
    return {
      id: seller._id?.toString() || seller.id,
      businessName: seller.businessName || "",
      contactPerson: seller.contactPerson || "",
      email: seller.email || "",
      phone: seller.phone,
      address: seller.address,
      gstNumber: seller.gstNumber,
      businessType: seller.businessType,
      status: seller.status || "pending",
      verified: seller.verified || false,
      commission: seller.commission || 0,
      rating: seller.rating,
      totalProducts: seller.totalProducts || 0,
      totalSales: seller.totalSales || 0,
      revenue: seller.revenue || 0,
      lastLogin: seller.lastLogin,
      createdAt: seller.createdAt,
      updatedAt: seller.updatedAt,
    };
  }
}
