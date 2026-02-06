import Order from "@/models/Order";
import Payment from "@/models/Payment";
import Seller from "@/models/Seller";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { 
  PayoutNotFoundError,
  FinanceDataFetchError,
  PayoutCreateError,
  PayoutUpdateError,
  RevenueCalculationError
} from "./AdminFinanceErrors";
import { IAdminFinanceRepository, FinanceOverview, RevenueData, AdminPayout, PayoutStats } from "./IAdminFinanceRepository";
import { FinanceQueryRequest, PayoutQueryRequest, PayoutCreateRequest, PayoutUpdateRequest } from "./AdminFinanceSchemas";
import { PaginationResult } from "../../shared/types";

export class AdminFinanceRepository implements IAdminFinanceRepository {
  private getDateFilter(query: FinanceQueryRequest) {
    const { period, startDate, endDate } = query;
    const now = new Date();
    
    if (startDate && endDate) {
      return {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    let start: Date;
    switch (period) {
      case '7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return { createdAt: { $gte: start } };
  }

  async getFinanceOverview(query: FinanceQueryRequest): Promise<FinanceOverview> {
    try {
      const dateFilter = this.getDateFilter(query);
      
      const revenueStats = await Order.aggregate([
        { $match: { ...dateFilter, paymentStatus: 'paid' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            totalOrders: { $sum: 1 }
          }
        }
      ]);

      const totalRevenue = revenueStats[0]?.totalRevenue || 0;
      const commissionRate = 0.1; // 10% commission
      const totalCommission = totalRevenue * commissionRate;

      // Get payout stats
      const payoutStats = await Payment.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalPayouts: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] } },
            pendingPayouts: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } }
          }
        }
      ]);

      const totalPayouts = payoutStats[0]?.totalPayouts || 0;
      const pendingPayouts = payoutStats[0]?.pendingPayouts || 0;
      const netProfit = totalCommission - totalPayouts;

      // Calculate growth (simplified - would need previous period data)
      const revenueGrowth = 0; // Placeholder

      return {
        totalRevenue,
        totalCommission,
        totalPayouts,
        pendingPayouts,
        netProfit,
        revenueGrowth,
        commissionRate,
      };
    } catch (error) {
      console.error("Error fetching finance overview:", error);
      throw new FinanceDataFetchError();
    }
  }

  async getRevenueData(query: FinanceQueryRequest): Promise<RevenueData[]> {
    try {
      const dateFilter = this.getDateFilter(query);
      const { groupBy } = query;

      let groupFormat: string;
      switch (groupBy) {
        case 'day':
          groupFormat = '%Y-%m-%d';
          break;
        case 'week':
          groupFormat = '%Y-%U';
          break;
        case 'month':
          groupFormat = '%Y-%m';
          break;
        default:
          groupFormat = '%Y-%m-%d';
      }

      const revenueData = await Order.aggregate([
        { $match: { ...dateFilter, paymentStatus: 'paid' } },
        {
          $group: {
            _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
            sellers: { $addToSet: '$sellerId' }
          }
        },
        {
          $project: {
            date: '$_id',
            revenue: 1,
            commission: { $multiply: ['$revenue', 0.1] },
            orders: 1,
            sellers: { $size: '$sellers' }
          }
        },
        { $sort: { date: 1 } }
      ]);

      return revenueData.map((item: any) => ({
        date: item.date,
        revenue: item.revenue,
        commission: item.commission,
        orders: item.orders,
        sellers: item.sellers,
      }));
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      throw new RevenueCalculationError();
    }
  }

  async getPayouts(query: PayoutQueryRequest): Promise<PaginationResult<AdminPayout>> {
    try {
      const { page, limit, sellerId, status, sortBy, sortOrder } = query;
      
      const filter: any = {};
      if (sellerId) filter.sellerId = sellerId;
      if (status) filter.status = status;

      const total = await Payment.countDocuments(filter);
      
      const payouts = await Payment.find(filter)
        .populate('sellerId', 'businessName email')
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const formattedPayouts: AdminPayout[] = payouts.map((payout: any) => ({
        id: payout._id.toString(),
        sellerId: payout.sellerId._id.toString(),
        sellerName: payout.sellerId.businessName,
        amount: payout.amount,
        status: payout.status,
        bankDetails: payout.bankDetails,
        requestedAt: payout.requestedAt,
        processedAt: payout.processedAt,
        notes: payout.notes,
        createdAt: payout.createdAt,
        updatedAt: payout.updatedAt,
      }));

      return {
        data: formattedPayouts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error("Error fetching payouts:", error);
      throw new FinanceDataFetchError();
    }
  }

  async getPayoutById(id: string): Promise<AdminPayout | null> {
    try {
      const payout = await Payment.findById(id)
        .populate('sellerId', 'businessName email')
        .lean();
      
      if (!payout) return null;

      return {
        id: payout._id.toString(),
        sellerId: payout.sellerId._id.toString(),
        sellerName: payout.sellerId.businessName,
        amount: payout.amount,
        status: payout.status,
        bankDetails: payout.bankDetails,
        requestedAt: payout.requestedAt,
        processedAt: payout.processedAt,
        notes: payout.notes,
        createdAt: payout.createdAt,
        updatedAt: payout.updatedAt,
      };
    } catch (error) {
      console.error("Error fetching payout by ID:", error);
      throw new FinanceDataFetchError();
    }
  }

  async getPayoutStats(): Promise<PayoutStats> {
    try {
      const stats = await Payment.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            processing: { $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] } },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
            totalAmount: { $sum: '$amount' },
            pendingAmount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } }
          }
        }
      ]);

      return stats[0] || {
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        totalAmount: 0,
        pendingAmount: 0,
      };
    } catch (error) {
      console.error("Error fetching payout stats:", error);
      throw new FinanceDataFetchError();
    }
  }

  async createPayout(data: PayoutCreateRequest): Promise<AdminPayout> {
    try {
      const payout = new Payment({
        ...data,
        status: 'pending',
        requestedAt: new Date(),
      });

      await payout.save();
      await payout.populate('sellerId', 'businessName email');

      return {
        id: payout._id.toString(),
        sellerId: payout.sellerId._id.toString(),
        sellerName: payout.sellerId.businessName,
        amount: payout.amount,
        status: payout.status,
        bankDetails: payout.bankDetails,
        requestedAt: payout.requestedAt,
        processedAt: payout.processedAt,
        notes: payout.notes,
        createdAt: payout.createdAt,
        updatedAt: payout.updatedAt,
      };
    } catch (error) {
      console.error("Error creating payout:", error);
      throw new PayoutCreateError();
    }
  }

  async updatePayout(id: string, data: PayoutUpdateRequest): Promise<AdminPayout> {
    try {
      const updateData: any = { ...data, updatedAt: new Date() };
      if (data.status === 'completed') {
        updateData.processedAt = new Date();
      }

      const payout = await Payment.findByIdAndUpdate(id, updateData, { new: true })
        .populate('sellerId', 'businessName email');

      if (!payout) {
        throw new PayoutNotFoundError(id);
      }

      return {
        id: payout._id.toString(),
        sellerId: payout.sellerId._id.toString(),
        sellerName: payout.sellerId.businessName,
        amount: payout.amount,
        status: payout.status,
        bankDetails: payout.bankDetails,
        requestedAt: payout.requestedAt,
        processedAt: payout.processedAt,
        notes: payout.notes,
        createdAt: payout.createdAt,
        updatedAt: payout.updatedAt,
      };
    } catch (error) {
      if (error instanceof PayoutNotFoundError) {
        throw error;
      }
      console.error("Error updating payout:", error);
      throw new PayoutUpdateError();
    }
  }

  async approvePayout(id: string): Promise<AdminPayout> {
    return this.updatePayout(id, { status: 'completed' });
  }

  async rejectPayout(id: string, reason: string): Promise<AdminPayout> {
    return this.updatePayout(id, { status: 'failed', notes: reason });
  }

  async getTopSellersByRevenue(limit: number = 10) {
    try {
      const topSellers = await Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.sellerId',
            revenue: { $sum: '$items.totalPrice' },
            orders: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'sellers',
            localField: '_id',
            foreignField: '_id',
            as: 'seller'
          }
        },
        { $unwind: '$seller' },
        {
          $project: {
            sellerId: '$_id',
            sellerName: '$seller.businessName',
            revenue: 1,
            commission: { $multiply: ['$revenue', 0.1] },
            orders: 1
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: limit }
      ]);

      return topSellers.map((seller: any) => ({
        sellerId: seller.sellerId.toString(),
        sellerName: seller.sellerName,
        revenue: seller.revenue,
        commission: seller.commission,
        orders: seller.orders,
      }));
    } catch (error) {
      console.error("Error fetching top sellers:", error);
      throw new FinanceDataFetchError();
    }
  }

  async getRevenueByCategory() {
    try {
      const categoryRevenue = await Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $lookup: {
            from: 'categories',
            localField: 'product.categoryId',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: '$category' },
        {
          $group: {
            _id: '$category._id',
            categoryName: { $first: '$category.name' },
            revenue: { $sum: '$items.totalPrice' }
          }
        },
        { $sort: { revenue: -1 } }
      ]);

      const totalRevenue = categoryRevenue.reduce((sum: number, cat: any) => sum + cat.revenue, 0);

      return categoryRevenue.map((cat: any) => ({
        categoryId: cat._id.toString(),
        categoryName: cat.categoryName,
        revenue: cat.revenue,
        percentage: totalRevenue > 0 ? Math.round((cat.revenue / totalRevenue) * 100) : 0,
      }));
    } catch (error) {
      console.error("Error fetching revenue by category:", error);
      throw new RevenueCalculationError();
    }
  }
}

export const adminFinanceRepository = new AdminFinanceRepository();