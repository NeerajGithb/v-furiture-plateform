import Order from "@/models/Order";
import Product from "@/models/Product";
import Payment from "@/models/Payment";
import { 
  EarningsFetchError, 
  TransactionNotFoundError, 
  PayoutRequestError,
  EarningsExportError 
} from "./SellerEarningsErrors";

export class SellerEarningsRepository {
  private getDateFilter(period: string) {
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7days':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        return {};
      default:
        startDate.setDate(now.getDate() - 30);
    }

    return { createdAt: { $gte: startDate } };
  }

  async getEarningsSummary(sellerId: string, period: string = '30days') {
    try {
      const dateFilter = this.getDateFilter(period);
      
      // Get seller's product IDs
      const sellerProducts = await Product.find({ sellerId }).distinct('_id');
      
      if (sellerProducts.length === 0) {
        return {
          totalRevenue: 0,
          completedRevenue: 0,
          pendingRevenue: 0,
          totalPayouts: 0,
          pendingPayouts: 0,
          platformFees: 0,
          growth: 0
        };
      }

      // Get paid orders for earnings calculation
      const paidOrders = await Order.find({
        'items.productId': { $in: sellerProducts },
        paymentStatus: 'paid',
        ...dateFilter
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

      // Get payout data
      const payouts = await Payment.find({
        sellerId,
        type: 'payout',
        ...dateFilter
      }).select('amount status').lean();

      const totalPayouts = payouts
        .filter((p: any) => p.status === 'completed')
        .reduce((sum, p: any) => sum + (p.amount || 0), 0);

      const pendingPayouts = payouts
        .filter((p: any) => p.status === 'pending')
        .reduce((sum, p: any) => sum + (p.amount || 0), 0);

      // Calculate growth (comparing current period vs previous period)
      const previousPeriodFilter = this.getPreviousPeriodFilter(period);
      const previousPaidOrders = await Order.find({
        'items.productId': { $in: sellerProducts },
        paymentStatus: 'paid',
        ...previousPeriodFilter
      }).select('totalAmount').lean();

      const previousRevenue = previousPaidOrders.reduce((sum, order: any) => sum + (order.totalAmount || 0), 0);
      const growth = previousRevenue > 0 
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
        : 0;

      return {
        totalRevenue,
        completedRevenue,
        pendingRevenue,
        totalPayouts,
        pendingPayouts,
        platformFees,
        growth: Math.round(growth * 100) / 100
      };
    } catch (error) {
      console.error("Error fetching earnings summary:", error);
      throw new EarningsFetchError("Failed to fetch earnings summary");
    }
  }

  private getPreviousPeriodFilter(period: string) {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();
    
    switch (period) {
      case '7days':
        startDate.setDate(now.getDate() - 14);
        endDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(now.getDate() - 60);
        endDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(now.getDate() - 180);
        endDate.setDate(now.getDate() - 90);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 2);
        endDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return {};
    }

    return { 
      createdAt: { 
        $gte: startDate,
        $lt: endDate
      } 
    };
  }

  async getTransactions(sellerId: string, options: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
  }) {
    try {
      const { page, limit, status, search } = options;
      const skip = (page - 1) * limit;

      // Get seller's product IDs
      const sellerProducts = await Product.find({ sellerId }).distinct('_id');
      
      if (sellerProducts.length === 0) {
        return {
          transactions: [],
          total: 0
        };
      }

      // Build query
      let query: any = {
        'items.productId': { $in: sellerProducts },
        paymentStatus: 'paid'
      };

      if (status && status !== 'all') {
        if (status === 'completed') {
          query.orderStatus = 'delivered';
        } else if (status === 'pending') {
          query.orderStatus = { $ne: 'delivered' };
        } else if (status === 'failed') {
          query.orderStatus = 'cancelled';
        }
      }

      // Add search functionality
      if (search) {
        query.$or = [
          { orderNumber: { $regex: search, $options: 'i' } },
          { 'shippingAddress.name': { $regex: search, $options: 'i' } }
        ];
      }

      const [orders, total] = await Promise.all([
        Order.find(query)
          .populate('userId', 'name email')
          .populate({
            path: 'items.productId',
            select: 'name',
            model: 'Product',
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Order.countDocuments(query)
      ]);

      const transactions = orders.map((order: any) => {
        const orderAmount = order.totalAmount || 0;
        const platformFee = Math.round(orderAmount * 0.05);
        const sellerAmount = orderAmount - platformFee;

        let status = 'pending';
        if (order.orderStatus === 'delivered') {
          const deliveredDate = order.deliveredAt ? new Date(order.deliveredAt) : null;
          const daysSinceDelivery = deliveredDate 
            ? Math.floor((Date.now() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24))
            : 0;
          status = daysSinceDelivery > 7 ? 'completed' : 'pending';
        } else if (order.orderStatus === 'cancelled') {
          status = 'failed';
        }

        return {
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          customerName: order.userId?.name || order.shippingAddress?.name || 'Unknown Customer',
          customerEmail: order.userId?.email || '',
          productNames: order.items?.map((item: any) => item.productId?.name || 'Unknown Product').join(', ') || '',
          orderAmount,
          platformFee,
          sellerAmount,
          status,
          orderStatus: order.orderStatus,
          createdAt: order.createdAt,
          deliveredAt: order.deliveredAt,
        };
      });

      return {
        transactions,
        total
      };
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw new EarningsFetchError("Failed to fetch transactions");
    }
  }

  async createPayoutRequest(sellerId: string, amount: number, bankDetails: any) {
    try {
      const payout = await Payment.create({
        sellerId,
        type: 'payout',
        amount,
        status: 'pending',
        bankDetails,
        requestedAt: new Date(),
      });

      return {
        payoutId: payout._id.toString(),
        amount,
        status: 'pending',
        requestedAt: payout.requestedAt,
      };
    } catch (error) {
      console.error("Error creating payout request:", error);
      throw new PayoutRequestError("Failed to create payout request");
    }
  }

  async calculateAvailablePayout(sellerId: string) {
    try {
      // Get seller's product IDs
      const sellerProducts = await Product.find({ sellerId }).distinct('_id');
      
      if (sellerProducts.length === 0) {
        return 0;
      }

      // Get completed orders (delivered for more than 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const completedOrders = await Order.find({
        'items.productId': { $in: sellerProducts },
        paymentStatus: 'paid',
        orderStatus: 'delivered',
        deliveredAt: { $lte: sevenDaysAgo }
      }).select('totalAmount').lean();

      const completedRevenue = completedOrders.reduce((sum, order: any) => sum + (order.totalAmount || 0), 0);
      const platformFees = completedRevenue * 0.05;
      const availableRevenue = completedRevenue - platformFees;

      // Subtract already paid out amounts
      const payouts = await Payment.find({
        sellerId,
        type: 'payout',
        status: { $in: ['completed', 'pending'] }
      }).select('amount').lean();

      const totalPayouts = payouts.reduce((sum, p: any) => sum + (p.amount || 0), 0);

      return Math.max(0, availableRevenue - totalPayouts);
    } catch (error) {
      console.error("Error calculating available payout:", error);
      throw new EarningsFetchError("Failed to calculate available payout");
    }
  }

  async getPayoutHistory(sellerId: string, options: {
    page: number;
    limit: number;
    status?: string;
  }) {
    try {
      const { page, limit, status } = options;
      const skip = (page - 1) * limit;

      const query: any = { 
        sellerId,
        type: 'payout'
      };

      if (status && status !== 'all') {
        query.status = status;
      }

      const [payouts, total] = await Promise.all([
        Payment.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Payment.countDocuments(query),
      ]);

      const formattedPayouts = payouts.map((payout: any) => ({
        id: payout._id.toString(),
        amount: payout.amount,
        status: payout.status,
        method: payout.bankDetails?.accountType || 'bank_transfer',
        createdAt: payout.createdAt,
        completedAt: payout.completedAt,
        requestedAt: payout.requestedAt,
      }));

      return {
        payouts: formattedPayouts,
        total
      };
    } catch (error) {
      console.error("Error fetching payout history:", error);
      throw new EarningsFetchError("Failed to fetch payout history");
    }
  }

  async cancelPayout(sellerId: string, payoutId: string) {
    try {
      const payout = await Payment.findOne({ 
        _id: payoutId, 
        sellerId,
        type: 'payout'
      });

      if (!payout) {
        throw new TransactionNotFoundError(payoutId);
      }

      if (payout.status !== 'pending') {
        throw new PayoutRequestError('Only pending payouts can be cancelled');
      }

      payout.status = 'cancelled';
      payout.cancelledAt = new Date();
      await payout.save();

      return {
        payoutId: payout._id.toString(),
        status: 'cancelled',
        cancelledAt: payout.cancelledAt,
      };
    } catch (error) {
      if (error instanceof TransactionNotFoundError || error instanceof PayoutRequestError) {
        throw error;
      }
      console.error("Error cancelling payout:", error);
      throw new PayoutRequestError("Failed to cancel payout");
    }
  }

  async getEarningsExportData(sellerId: string, period: string) {
    try {
      const dateFilter = this.getDateFilter(period);
      
      // Get all product IDs for this seller
      const sellerProducts = await Product.find({ sellerId }).select('_id name').lean();
      const productIds = sellerProducts.map((p: any) => p._id);

      if (productIds.length === 0) {
        return [];
      }

      const orders = await Order.find({
        'items.productId': { $in: productIds },
        paymentStatus: 'paid',
        ...dateFilter
      })
        .populate('userId', 'name email')
        .populate({
          path: 'items.productId',
          select: 'name',
          model: 'Product',
        })
        .sort({ createdAt: -1 })
        .lean();

      return orders.map((order: any) => {
        const customerName = order.userId?.name || order.shippingAddress?.name || 'Unknown Customer';
        const customerEmail = order.userId?.email || '';
        const productNames = order.items?.map((item: any) => item.productId?.name || 'Unknown Product').join('; ') || '';
        const orderAmount = order.totalAmount || 0;
        const platformFee = Math.round(orderAmount * 0.05);
        const sellerAmount = orderAmount - platformFee;
        const orderDate = new Date(order.createdAt).toLocaleDateString();

        let status = 'Pending';
        if (order.orderStatus === 'delivered') {
          const deliveredDate = order.deliveredAt ? new Date(order.deliveredAt) : null;
          const daysSinceDelivery = deliveredDate 
            ? Math.floor((Date.now() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24))
            : 0;
          status = daysSinceDelivery > 7 ? 'Completed' : 'Pending';
        } else if (order.orderStatus === 'cancelled') {
          status = 'Failed';
        }

        return {
          orderNumber: order.orderNumber,
          customerName,
          customerEmail,
          productNames,
          orderAmount,
          platformFee,
          sellerAmount,
          status,
          orderDate
        };
      });
    } catch (error) {
      console.error("Error fetching export data:", error);
      throw new EarningsExportError("Failed to fetch export data");
    }
  }
}

export const sellerEarningsRepository = new SellerEarningsRepository();