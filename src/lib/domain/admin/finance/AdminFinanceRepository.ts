import Order from "@/models/Order";
import Payment from "@/models/Payment";
import { PayoutNotFoundError } from "./AdminFinanceErrors";
import { IAdminFinanceRepository, FinanceOverview, RevenueData, AdminPayout, PayoutStats, FinanceData } from "./IAdminFinanceRepository";
import { FinanceQueryRequest, PayoutQueryRequest, PayoutCreateRequest, PayoutUpdateRequest } from "./AdminFinanceSchemas";
import { PaginationResult } from "../../shared/types";
import { getStartDateFromPeriod } from "../../shared/dateUtils";

export class AdminFinanceRepository implements IAdminFinanceRepository {
  private getDateFilter(query: FinanceQueryRequest) {
    const { period, startDate, endDate } = query;
    
    if (startDate && endDate) {
      return {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    if (period) {
      const start = getStartDateFromPeriod(period);
      return { createdAt: { $gte: start } };
    }

    return {};
  }

  async getFinanceOverview(query: FinanceQueryRequest): Promise<FinanceOverview> {
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
    const commissionRate = 0.1;
    const totalCommission = totalRevenue * commissionRate;

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
    const revenueGrowth = 0;

    return {
      totalRevenue,
      totalCommission,
      totalPayouts,
      pendingPayouts,
      netProfit,
      revenueGrowth,
      commissionRate,
    };
  }

  async getFinanceData(query: FinanceQueryRequest): Promise<FinanceData> {
    const dateFilter = this.getDateFilter(query);
    
    // Get order statistics
    const orderStats = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          completedOrders: { $sum: { $cond: [{ $eq: ['$orderStatus', 'delivered'] }, 1, 0] } },
          pendingOrders: { $sum: { $cond: [{ $in: ['$orderStatus', ['pending', 'confirmed', 'processing', 'shipped']] }, 1, 0] } },
          totalRevenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] } },
          completedRevenue: { $sum: { $cond: [{ $and: [{ $eq: ['$paymentStatus', 'paid'] }, { $eq: ['$orderStatus', 'delivered'] }] }, '$totalAmount', 0] } },
          pendingRevenue: { $sum: { $cond: [{ $and: [{ $eq: ['$paymentStatus', 'paid'] }, { $ne: ['$orderStatus', 'delivered'] }] }, '$totalAmount', 0] } },
          totalPayments: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] } }
        }
      }
    ]);

    const stats = orderStats[0] || {
      totalOrders: 0,
      completedOrders: 0,
      pendingOrders: 0,
      totalRevenue: 0,
      completedRevenue: 0,
      pendingRevenue: 0,
      totalPayments: 0
    };

    // Get payout statistics
    const payoutStats = await Payment.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalPayouts: { $sum: '$amount' },
          completedPayouts: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] } },
          pendingPayouts: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } }
        }
      }
    ]);

    const payouts = payoutStats[0] || {
      totalPayouts: 0,
      completedPayouts: 0,
      pendingPayouts: 0
    };

    // Calculate platform fees (10% commission)
    const platformFees = stats.totalRevenue * 0.1;

    // Get payment method breakdown
    const paymentMethodStats = await Order.aggregate([
      { $match: { ...dateFilter, paymentStatus: 'paid' } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 }
        }
      }
    ]);

    const paymentMethods: Record<string, number> = {};
    paymentMethodStats.forEach((stat: any) => {
      paymentMethods[stat._id || 'unknown'] = stat.count;
    });

    // Get order status breakdown
    const orderStatusStats = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const orderStatus: Record<string, number> = {};
    orderStatusStats.forEach((stat: any) => {
      orderStatus[stat._id] = stat.count;
    });

    // Get recent transactions (paid orders only)
    const transactions = await Order.find({ ...dateFilter, paymentStatus: 'paid' })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const formattedTransactions = transactions.map((order: any) => {
      const totalAmount = order.totalAmount;
      const platformFee = totalAmount * 0.1;
      const payout = totalAmount - platformFee;

      return {
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        customerName: order.userId?.name || 'Unknown',
        customerEmail: order.userId?.email || 'N/A',
        totalAmount,
        platformFee,
        payout,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt
      };
    });

    return {
      summary: {
        totalRevenue: stats.totalRevenue,
        completedRevenue: stats.completedRevenue,
        pendingRevenue: stats.pendingRevenue,
        platformFees,
        completedPayouts: payouts.completedPayouts,
        pendingPayouts: payouts.pendingPayouts,
        totalPayouts: payouts.totalPayouts,
        revenueGrowth: 0 // TODO: Calculate based on previous period
      },
      stats: {
        totalOrders: stats.totalOrders,
        completedOrders: stats.completedOrders,
        pendingOrders: stats.pendingOrders,
        totalPayments: stats.totalPayments
      },
      breakdown: {
        paymentMethods,
        orderStatus
      },
      transactions: formattedTransactions
    };
  }

  async getRevenueData(query: FinanceQueryRequest): Promise<RevenueData[]> {
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
  }

  async getPayouts(query: PayoutQueryRequest): Promise<PaginationResult<AdminPayout>> {
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
  }

  async getPayoutById(id: string): Promise<AdminPayout | null> {
    const payout = await Payment.findById(id)
      .populate('sellerId', 'businessName email')
      .lean() as any;
    
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
  }

  async getPayoutStats(): Promise<PayoutStats> {
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
  }

  async createPayout(data: PayoutCreateRequest): Promise<AdminPayout> {
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
  }

  async updatePayout(id: string, data: PayoutUpdateRequest): Promise<AdminPayout> {
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
  }

  async approvePayout(id: string): Promise<AdminPayout> {
    return this.updatePayout(id, { status: 'completed' });
  }

  async rejectPayout(id: string, reason: string): Promise<AdminPayout> {
    return this.updatePayout(id, { status: 'failed', notes: reason });
  }

  async getTopSellersByRevenue(limit: number = 10) {
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
  }

  async getRevenueByCategory() {
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
  }
}

export const adminFinanceRepository = new AdminFinanceRepository();
