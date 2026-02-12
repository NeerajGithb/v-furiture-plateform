import Order from "@/models/Order";
import Product from "@/models/Product";
import Payment from "@/models/Payment";
import { getStartDateFromPeriod } from "@/lib/domain/shared/dateUtils";
import { 
  EarningsFetchError, 
  TransactionNotFoundError, 
  PayoutRequestError,
  EarningsExportError 
} from "./SellerEarningsErrors";

export class SellerEarningsRepository {
  async getEarningsSummary(sellerId: string, period: string = '30d') {
    const startDate = getStartDateFromPeriod(period);
    const dateFilter = { createdAt: { $gte: startDate } };
    
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

    const paidOrders = await Order.find({
      'items.productId': { $in: sellerProducts },
      paymentStatus: 'paid',
      orderStatus: 'delivered',
      ...dateFilter
    }).select('totalAmount orderStatus createdAt deliveredAt').lean();

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

    const pendingRevenue = totalRevenue - completedRevenue;

    const platformFees = totalRevenue * 0.05;

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

    const previousStartDate = new Date(startDate);
    const periodDuration = Date.now() - startDate.getTime();
    previousStartDate.setTime(startDate.getTime() - periodDuration);
    
    const previousPaidOrders = await Order.find({
      'items.productId': { $in: sellerProducts },
      paymentStatus: 'paid',
      orderStatus: 'delivered',
      createdAt: { 
        $gte: previousStartDate,
        $lt: startDate
      }
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
  }

  async getTransactions(sellerId: string, options: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
  }) {
    const { page, limit, status, search } = options;
    const skip = (page - 1) * limit;

    const sellerProducts = await Product.find({ sellerId }).distinct('_id');
    
    if (sellerProducts.length === 0) {
      return {
        transactions: [],
        total: 0
      };
    }

    let query: any = {
      'items.productId': { $in: sellerProducts },
      paymentStatus: 'paid'
    };

    if (status) {
      if (status === 'completed') {
        query.orderStatus = 'delivered';
      } else if (status === 'pending') {
        query.orderStatus = { $ne: 'delivered' };
      } else if (status === 'failed') {
        query.orderStatus = 'cancelled';
      }
    }

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
  }

  async createPayoutRequest(sellerId: string, amount: number, bankDetails: any) {
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
  }

  async calculateAvailablePayout(sellerId: string) {
    const sellerProducts = await Product.find({ sellerId }).distinct('_id');
    
    if (sellerProducts.length === 0) {
      return 0;
    }

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

    const payouts = await Payment.find({
      sellerId,
      type: 'payout',
      status: { $in: ['completed', 'pending'] }
    }).select('amount').lean();

    const totalPayouts = payouts.reduce((sum, p: any) => sum + (p.amount || 0), 0);

    return Math.max(0, availableRevenue - totalPayouts);
  }

  async getPayoutHistory(sellerId: string, options: {
    page: number;
    limit: number;
    status?: string;
  }) {
    const { page, limit, status } = options;
    const skip = (page - 1) * limit;

    const query: any = { 
      sellerId,
      type: 'payout'
    };

    if (status) {
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
  }

  async cancelPayout(sellerId: string, payoutId: string) {
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
  }

  async getEarningsExportData(sellerId: string, period: string) {
    const startDate = getStartDateFromPeriod(period);
    const dateFilter = { createdAt: { $gte: startDate } };
    
    const sellerProducts = await Product.find({ sellerId }).select('_id name').lean();
    const productIds = sellerProducts.map((p: any) => p._id);

    if (productIds.length === 0) {
      return [];
    }

    const orders = await Order.find({
      'items.productId': { $in: productIds },
      paymentStatus: 'paid',
      orderStatus: 'delivered',
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
  }
}

export const sellerEarningsRepository = new SellerEarningsRepository();