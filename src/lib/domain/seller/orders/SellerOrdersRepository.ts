import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { 
  OrdersFetchError, 
  OrderNotFoundError, 
  OrderUpdateError,
  UnauthorizedOrderAccessError,
  BulkOrderUpdateError,
  OrderExportError 
} from "./SellerOrdersErrors";

export class SellerOrdersRepository {
  private getDateFilter(period: string) {
    const now = new Date();
    let startDate: Date | null = null;

    switch (period) {
      case '30min':
        startDate = new Date(now.getTime() - 30 * 60 * 1000);
        break;
      case '1hour':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '1day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '1year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
      default:
        return {};
    }

    return startDate ? { createdAt: { $gte: startDate } } : {};
  }

  async getSellerProductIds(sellerId: string) {
    try {
      const sellerProducts = await Product.find({ sellerId }).select('_id').lean();
      return sellerProducts.map((p: any) => p._id.toString());
    } catch (error) {
      console.error("Error fetching seller product IDs:", error);
      throw new OrdersFetchError("Failed to fetch seller products");
    }
  }

  async getOrdersList(sellerId: string, options: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    period?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    try {
      // Ensure User model is registered
      if (!User) {
        throw new Error('User model not available');
      }

      const productIds = await this.getSellerProductIds(sellerId);
      if (productIds.length === 0) {
        return { orders: [], total: 0 };
      }

      const dateFilter = this.getDateFilter(options.period || 'all');
      const query: Record<string, any> = {
        'items.productId': { $in: productIds },
        ...dateFilter
      };

      if (options.status) {
        query.orderStatus = options.status;
      }

      const orders = await Order.find(query)
        .populate('userId', 'name email phone')
        .populate('items.productId', 'name mainImage price')
        .sort({ [options.sortBy || 'createdAt']: options.sortOrder === 'asc' ? 1 : -1 })
        .lean();

      // Apply search filter after population
      let filteredOrders = orders;
      if (options.search) {
        const searchLower = options.search.toLowerCase();
        filteredOrders = orders.filter((order: any) => {
          const customerName = order.userId?.name?.toLowerCase() || '';
          const customerEmail = order.userId?.email?.toLowerCase() || '';
          const orderNumber = order.orderNumber?.toLowerCase() || '';
          
          return customerName.includes(searchLower) || 
                 customerEmail.includes(searchLower) || 
                 orderNumber.includes(searchLower);
        });
      }

      // Apply pagination
      const total = filteredOrders.length;
      const startIndex = (options.page - 1) * options.limit;
      const paginatedOrders = filteredOrders.slice(startIndex, startIndex + options.limit);

      // Format orders
      const formattedOrders = paginatedOrders.map((order: any) => ({
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        userId: {
          id: order.userId?._id?.toString() || '',
          name: order.userId?.name || 'Unknown',
          email: order.userId?.email || '',
        },
        customerName: order.userId?.name || 'Unknown',
        customerEmail: order.userId?.email || '',
        customerPhone: order.shippingAddress?.phone || '',
        items: order.items.map((item: any) => ({
          id: item._id?.toString() || '',
          productId: {
            id: item.productId?._id?.toString() || '',
            name: item.productId?.name || 'Unknown Product',
            mainImage: item.productId?.mainImage,
            slug: item.productId?.slug,
          },
          name: item.name || item.productId?.name || 'Unknown Product',
          price: item.price || 0,
          quantity: item.quantity || 1,
          productImage: item.productId?.mainImage?.url || item.productImage || '',
          selectedVariant: item.selectedVariant,
          sku: item.sku,
        })),
        subtotal: order.subtotal || 0,
        shippingCost: order.shippingCost || 0,
        tax: order.tax || 0,
        discount: order.discount || 0,
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod || '',
        shippingAddress: {
          fullName: order.shippingAddress?.fullName || '',
          phone: order.shippingAddress?.phone || '',
          addressLine1: order.shippingAddress?.addressLine1 || '',
          addressLine2: order.shippingAddress?.addressLine2 || '',
          city: order.shippingAddress?.city || '',
          state: order.shippingAddress?.state || '',
          postalCode: order.shippingAddress?.postalCode || '',
          country: order.shippingAddress?.country || 'India',
        },
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
        expectedDeliveryDate: order.expectedDeliveryDate,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        notes: order.notes,
      }));

      return {
        orders: formattedOrders,
        total
      };
    } catch (error) {
      console.error("Error fetching orders list:", error);
      throw new OrdersFetchError("Failed to fetch orders list");
    }
  }

  async getOrderById(sellerId: string, orderId: string) {
    try {
      const order = await Order.findById(orderId)
        .populate({
          path: 'items.productId',
          select: 'name mainImage slug',
        })
        .lean();

      if (!order) {
        throw new OrderNotFoundError(orderId);
      }

      // Verify seller owns products in this order
      const hasSellerItems = order.items?.some((item: any) =>
        item.sellerId?.toString() === sellerId
      );

      if (!hasSellerItems) {
        throw new UnauthorizedOrderAccessError();
      }

      // Format order items
      const formattedOrder = {
        ...order,
        id: order._id.toString(),
        items: order.items.map((item: any) => ({
          ...item,
          id: item._id?.toString(),
          productImage: item.productId?.mainImage?.url || item.productImage || '',
        })),
      };

      return formattedOrder;
    } catch (error) {
      if (error instanceof OrderNotFoundError || error instanceof UnauthorizedOrderAccessError) {
        throw error;
      }
      console.error("Error fetching order:", error);
      throw new OrdersFetchError("Failed to fetch order");
    }
  }

  async updateOrderStatus(sellerId: string, orderId: string, updates: {
    status: string;
    trackingNumber?: string;
    notes?: string;
  }) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new OrderNotFoundError(orderId);
      }

      // Verify seller owns products in this order
      const hasSellerItems = order.items.some((item: any) =>
        item.sellerId?.toString() === sellerId
      );

      if (!hasSellerItems) {
        throw new UnauthorizedOrderAccessError();
      }

      // Update order
      order.orderStatus = updates.status;
      if (updates.trackingNumber) {
        order.trackingNumber = updates.trackingNumber;
      }
      if (updates.notes) {
        order.notes = updates.notes;
      }

      // Set timestamps
      if (updates.status === 'delivered' && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.deliveredAt = new Date();
      }
      if (updates.status === 'confirmed' && !order.confirmedAt) {
        order.confirmedAt = new Date();
      }
      if (updates.status === 'shipped' && !order.shippedAt) {
        order.shippedAt = new Date();
      }

      await order.save();
      return order;
    } catch (error) {
      if (error instanceof OrderNotFoundError || error instanceof UnauthorizedOrderAccessError) {
        throw error;
      }
      console.error("Error updating order status:", error);
      throw new OrderUpdateError("Failed to update order status");
    }
  }

  async getOrdersStats(sellerId: string, filters: {
    status?: string;
    period?: string;
  } = {}) {
    try {
      const productIds = await this.getSellerProductIds(sellerId);
      if (productIds.length === 0) {
        return {
          total: 0,
          pending: 0,
          confirmed: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
          returned: 0
        };
      }

      const dateFilter = this.getDateFilter(filters.period || 'all');
      const query: Record<string, any> = {
        'items.productId': { $in: productIds },
        ...dateFilter
      };

      if (filters.status) {
        query.orderStatus = filters.status;
      }

      const stats = await Order.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: {
              $sum: { $cond: [{ $eq: ['$orderStatus', 'pending'] }, 1, 0] }
            },
            confirmed: {
              $sum: { $cond: [{ $eq: ['$orderStatus', 'confirmed'] }, 1, 0] }
            },
            processing: {
              $sum: { $cond: [{ $eq: ['$orderStatus', 'processing'] }, 1, 0] }
            },
            shipped: {
              $sum: { $cond: [{ $eq: ['$orderStatus', 'shipped'] }, 1, 0] }
            },
            delivered: {
              $sum: { $cond: [{ $eq: ['$orderStatus', 'delivered'] }, 1, 0] }
            },
            cancelled: {
              $sum: { $cond: [{ $eq: ['$orderStatus', 'cancelled'] }, 1, 0] }
            },
            returned: {
              $sum: { $cond: [{ $eq: ['$orderStatus', 'returned'] }, 1, 0] }
            }
          }
        }
      ]);

      return stats[0] || {
        total: 0,
        pending: 0,
        confirmed: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        returned: 0
      };
    } catch (error) {
      console.error("Error fetching orders stats:", error);
      throw new OrdersFetchError("Failed to fetch orders statistics");
    }
  }

  async bulkUpdateOrders(sellerId: string, orderIds: string[], updates: any) {
    try {
      const productIds = await this.getSellerProductIds(sellerId);

      // Verify all orders belong to the seller
      const orders = await Order.find({
        _id: { $in: orderIds },
        'items.productId': { $in: productIds }
      });

      if (orders.length !== orderIds.length) {
        throw new BulkOrderUpdateError('Some orders not found or unauthorized');
      }

      // Perform bulk update
      const result = await Order.updateMany(
        {
          _id: { $in: orderIds },
          'items.productId': { $in: productIds }
        },
        {
          $set: {
            ...updates,
            updatedAt: new Date()
          }
        }
      );

      return {
        updatedCount: result.modifiedCount,
        message: `${result.modifiedCount} order(s) updated successfully`
      };
    } catch (error) {
      if (error instanceof BulkOrderUpdateError) {
        throw error;
      }
      console.error("Error bulk updating orders:", error);
      throw new BulkOrderUpdateError("Failed to bulk update orders");
    }
  }

  async getOrdersExportData(sellerId: string, filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
    try {
      const productIds = await this.getSellerProductIds(sellerId);
      if (productIds.length === 0) {
        return [];
      }

      const query: any = {
        'items.productId': { $in: productIds }
      };

      if (filters.status && filters.status !== 'all') {
        query.orderStatus = filters.status;
      }

      if (filters.startDate && filters.endDate) {
        query.createdAt = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      }

      const orders = await Order.find(query)
        .populate('userId', 'name email')
        .populate('items.productId', 'name')
        .select('orderNumber userId totalAmount orderStatus paymentStatus shippingAddress createdAt')
        .sort({ createdAt: -1 })
        .lean();

      return orders.map((order: any) => ({
        orderNumber: order.orderNumber || '',
        customerName: order.userId?.name || '',
        customerEmail: order.userId?.email || '',
        totalAmount: order.totalAmount || 0,
        orderStatus: order.orderStatus || '',
        paymentStatus: order.paymentStatus || '',
        shippingAddress: order.shippingAddress ? `${order.shippingAddress.address}, ${order.shippingAddress.city}` : '',
        orderDate: new Date(order.createdAt).toLocaleDateString()
      }));
    } catch (error) {
      console.error("Error fetching export data:", error);
      throw new OrderExportError("Failed to fetch orders export data");
    }
  }

  async updateOrderTracking(sellerId: string, orderId: string, trackingData: {
    trackingNumber: string;
    carrier: string;
  }) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new OrderNotFoundError(orderId);
      }

      // Verify seller owns products in this order
      const hasSellerItems = order.items.some((item: any) =>
        item.sellerId?.toString() === sellerId
      );

      if (!hasSellerItems) {
        throw new UnauthorizedOrderAccessError();
      }

      order.trackingNumber = trackingData.trackingNumber;
      order.carrier = trackingData.carrier;
      order.updatedAt = new Date();

      await order.save();
      return order;
    } catch (error) {
      if (error instanceof OrderNotFoundError || error instanceof UnauthorizedOrderAccessError) {
        throw error;
      }
      console.error("Error updating order tracking:", error);
      throw new OrderUpdateError("Failed to update order tracking");
    }
  }

  async addOrderNotes(sellerId: string, orderId: string, notesData: {
    notes: string;
  }) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new OrderNotFoundError(orderId);
      }

      // Verify seller owns products in this order
      const hasSellerItems = order.items.some((item: any) =>
        item.sellerId?.toString() === sellerId
      );

      if (!hasSellerItems) {
        throw new UnauthorizedOrderAccessError();
      }

      order.notes = notesData.notes;
      order.updatedAt = new Date();

      await order.save();
      return order;
    } catch (error) {
      if (error instanceof OrderNotFoundError || error instanceof UnauthorizedOrderAccessError) {
        throw error;
      }
      console.error("Error adding order notes:", error);
      throw new OrderUpdateError("Failed to add order notes");
    }
  }

  async cancelOrder(sellerId: string, orderId: string, cancelData: {
    reason: string;
  }) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new OrderNotFoundError(orderId);
      }

      // Verify seller owns products in this order
      const hasSellerItems = order.items.some((item: any) =>
        item.sellerId?.toString() === sellerId
      );

      if (!hasSellerItems) {
        throw new UnauthorizedOrderAccessError();
      }

      // Check if order can be cancelled
      if (['delivered', 'cancelled'].includes(order.orderStatus)) {
        throw new OrderUpdateError(`Cannot cancel order with status: ${order.orderStatus}`);
      }

      order.orderStatus = 'cancelled';
      order.cancellationReason = cancelData.reason;
      order.cancelledAt = new Date();
      order.updatedAt = new Date();

      await order.save();
      return order;
    } catch (error) {
      if (error instanceof OrderNotFoundError || error instanceof UnauthorizedOrderAccessError || error instanceof OrderUpdateError) {
        throw error;
      }
      console.error("Error cancelling order:", error);
      throw new OrderUpdateError("Failed to cancel order");
    }
  }
}

export const sellerOrdersRepository = new SellerOrdersRepository();