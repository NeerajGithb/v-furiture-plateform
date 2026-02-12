import { Types } from 'mongoose';
import Order from '@/models/Order';
import Product from '@/models/Product';

export interface SellerEarningsData {
  totalRevenue: number;
  completedRevenue: number;
  pendingRevenue: number;
  platformFees: number;
  growth: number;
}

export interface SellerTransaction {
  _id: string;
  orderNumber: string;
  customerName: string;
  sellerAmount: number;
  platformFee: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  orderStatus: string;
}

export class SellerEarningsCalculator {
  private sellerId: string;

  constructor(sellerId: string) {
    this.sellerId = sellerId;
  }

  /**
   * Calculate seller-specific earnings using efficient aggregation
   */
  async calculateEarningsSummary(period: string = '30days'): Promise<SellerEarningsData> {
    const { startDate, previousStartDate } = this.getDateRange(period);

    // Use aggregation to calculate seller-specific earnings efficiently
    const [currentPeriodData, previousPeriodData] = await Promise.all([
      this.aggregateSellerEarnings(startDate),
      this.aggregateSellerEarnings(previousStartDate, startDate)
    ]);

    const current = currentPeriodData[0] || this.getEmptyEarnings();
    const previous = previousPeriodData[0] || this.getEmptyEarnings();

    // Calculate growth
    const growth = previous.totalRevenue > 0 
      ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100 
      : 0;

    return {
      totalRevenue: current.totalRevenue,
      completedRevenue: current.completedRevenue,
      pendingRevenue: current.pendingRevenue,
      platformFees: current.platformFees,
      growth: Math.round(growth * 10) / 10
    };
  }

  /**
   * Get seller transactions with proper seller-specific amounts
   */
  async getSellerTransactions(filters: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}): Promise<{ transactions: SellerTransaction[]; total: number }> {
    const { page = 1, limit = 20, status, search } = filters;
    const skip = (page - 1) * limit;

    // Build match conditions
    const matchConditions: any = {
      'items.sellerId': new Types.ObjectId(this.sellerId),
      paymentStatus: 'paid'
    };

    if (status && status !== 'all') {
      if (status === 'completed') {
        matchConditions.orderStatus = 'delivered';
        matchConditions.deliveredAt = { $lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
      } else if (status === 'pending') {
        matchConditions.$or = [
          { orderStatus: { $in: ['confirmed', 'processing', 'shipped'] } },
          { 
            orderStatus: 'delivered',
            deliveredAt: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        ];
      } else if (status === 'failed') {
        matchConditions.orderStatus = 'cancelled';
      }
    }

    if (search) {
      matchConditions.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: search, $options: 'i' } }
      ];
    }

    const pipeline: any[] = [
      { $match: matchConditions },
      {
        $addFields: {
          sellerItems: {
            $filter: {
              input: '$items',
              cond: { $eq: ['$$this.sellerId', new Types.ObjectId(this.sellerId)] }
            }
          }
        }
      },
      {
        $addFields: {
          sellerSubtotal: { $sum: '$sellerItems.totalPrice' },
          sellerPlatformFee: { $multiply: [{ $sum: '$sellerItems.totalPrice' }, 0.05] }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $addFields: {
          customerName: {
            $ifNull: [
              { $arrayElemAt: ['$user.name', 0] },
              '$shippingAddress.name'
            ]
          },
          transactionStatus: {
            $cond: {
              if: { $eq: ['$orderStatus', 'delivered'] },
              then: {
                $cond: {
                  if: { $lte: ['$deliveredAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                  then: 'completed',
                  else: 'pending'
                }
              },
              else: {
                $cond: {
                  if: { $eq: ['$orderStatus', 'cancelled'] },
                  then: 'failed',
                  else: 'pending'
                }
              }
            }
          }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    const [transactions, totalCount] = await Promise.all([
      Order.aggregate(pipeline),
      Order.aggregate([
        { $match: matchConditions },
        { $count: 'total' }
      ])
    ]);

    const formattedTransactions: SellerTransaction[] = transactions.map((order: any) => ({
      _id: order._id.toString(),
      orderNumber: order.orderNumber,
      customerName: order.customerName || 'Unknown Customer',
      sellerAmount: Math.round((order.sellerSubtotal || 0) - (order.sellerPlatformFee || 0)),
      platformFee: Math.round(order.sellerPlatformFee || 0),
      status: order.transactionStatus,
      createdAt: order.createdAt,
      orderStatus: order.orderStatus
    }));

    return {
      transactions: formattedTransactions,
      total: totalCount[0]?.total || 0
    };
  }

  /**
   * Efficient aggregation for seller earnings
   */
  private async aggregateSellerEarnings(startDate: Date, endDate?: Date) {
    const matchConditions: any = {
      'items.sellerId': new Types.ObjectId(this.sellerId),
      paymentStatus: 'paid',
      orderStatus: 'delivered',
      createdAt: { $gte: startDate }
    };

    if (endDate) {
      matchConditions.createdAt.$lt = endDate;
    }

    return Order.aggregate([
      { $match: matchConditions },
      { $unwind: '$items' },
      { $match: { 'items.sellerId': new Types.ObjectId(this.sellerId) } },
      {
        $addFields: {
          itemTotal: '$items.totalPrice',
          itemPlatformFee: { $multiply: ['$items.totalPrice', 0.05] },
          itemSellerAmount: { 
            $subtract: ['$items.totalPrice', { $multiply: ['$items.totalPrice', 0.05] }] 
          },
          isCompleted: {
            $and: [
              { $eq: ['$orderStatus', 'delivered'] },
              { $lte: ['$deliveredAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] }
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$itemTotal' },
          platformFees: { $sum: '$itemPlatformFee' },
          completedRevenue: {
            $sum: {
              $cond: ['$isCompleted', '$itemSellerAmount', 0]
            }
          },
          pendingRevenue: {
            $sum: {
              $cond: ['$isCompleted', 0, '$itemSellerAmount']
            }
          }
        }
      }
    ]);
  }

  /**
   * Get date ranges for period calculations
   */
  private getDateRange(period: string) {
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
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const periodDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(startDate.getDate() - periodDays);

    return { startDate, previousStartDate };
  }

  /**
   * Empty earnings structure
   */
  private getEmptyEarnings() {
    return {
      totalRevenue: 0,
      completedRevenue: 0,
      pendingRevenue: 0,
      platformFees: 0
    };
  }
}

/**
 * Calculate available payout amount for seller
 */
export async function calculateAvailablePayout(sellerId: string): Promise<number> {
  const result = await Order.aggregate([
    {
      $match: {
        'items.sellerId': new Types.ObjectId(sellerId),
        paymentStatus: 'paid',
        orderStatus: 'delivered',
        deliveredAt: { $lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    },
    { $unwind: '$items' },
    { $match: { 'items.sellerId': new Types.ObjectId(sellerId) } },
    {
      $group: {
        _id: null,
        availableAmount: {
          $sum: {
            $subtract: ['$items.totalPrice', { $multiply: ['$items.totalPrice', 0.05] }]
          }
        }
      }
    }
  ]);

  return result[0]?.availableAmount || 0;
}