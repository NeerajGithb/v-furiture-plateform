import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { getStartDateFromPeriod } from "@/lib/domain/shared/dateUtils";
import { 
  OrderNotFoundError, 
  OrderUpdateError,
  UnauthorizedOrderAccessError,
  BulkOrderUpdateError
} from "./SellerOrdersErrors";

export class SellerOrdersRepository {
  async getSellerProductIds(sellerId: string) {
    const sellerProducts = await Product.find({ sellerId }).select('_id').lean();
    return sellerProducts.map((p: any) => p._id);
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
    if (!User) {
      throw new Error('User model not available');
    }

    const productIds = await this.getSellerProductIds(sellerId);
    if (productIds.length === 0) {
      return { orders: [], total: 0 };
    }

    const query: Record<string, any> = {
      'items.productId': { $in: productIds }
    };

    if (options.period) {
      const startDate = getStartDateFromPeriod(options.period);
      query.createdAt = { $gte: startDate };
    }

    if (options.status) {
      query.orderStatus = options.status;
    }

    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name mainImage price')
      .sort({ [options.sortBy || 'createdAt']: options.sortOrder === 'asc' ? 1 : -1 })
      .lean();

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

    const total = filteredOrders.length;
    const startIndex = (options.page - 1) * options.limit;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + options.limit);

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
  }

  async getOrderById(sellerId: string, orderId: string) {
    const order: any = await Order.findById(orderId)
      .populate({
        path: 'items.productId',
        select: 'name mainImage slug sellerId',
      })
      .lean();

    if (!order) {
      throw new OrderNotFoundError(orderId);
    }

    const hasSellerItems = order.items?.some((item: any) => {
      const itemSellerId = item.sellerId?.toString() || item.productId?.sellerId?.toString();
      return itemSellerId === sellerId;
    });

    if (!hasSellerItems) {
      throw new UnauthorizedOrderAccessError();
    }

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
  }

  async updateOrderStatus(sellerId: string, orderId: string, updates: {
    status: string;
    trackingNumber?: string;
    notes?: string;
  }) {
    const order = await Order.findById(orderId).populate('items.productId', 'sellerId');
    if (!order) {
      throw new OrderNotFoundError(orderId);
    }

    const hasSellerItems = order.items.some((item: any) => {
      const itemSellerId = item.sellerId?.toString() || item.productId?.sellerId?.toString();
      return itemSellerId === sellerId;
    });

    if (!hasSellerItems) {
      throw new UnauthorizedOrderAccessError();
    }

    const updateFields: any = {
      orderStatus: updates.status,
      updatedAt: new Date()
    };

    if (updates.trackingNumber) {
      updateFields.trackingNumber = updates.trackingNumber;
    }
    if (updates.notes) {
      updateFields.notes = updates.notes;
    }

    if (updates.status === 'delivered' && order.paymentStatus !== 'paid') {
      updateFields.paymentStatus = 'paid';
      updateFields.deliveredAt = new Date();
    }
    if (updates.status === 'confirmed' && !order.confirmedAt) {
      updateFields.confirmedAt = new Date();
    }
    if (updates.status === 'shipped' && !order.shippedAt) {
      updateFields.shippedAt = new Date();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: updateFields },
      { new: true, runValidators: false }
    );

    return updatedOrder;
  }

  async getOrdersStats(sellerId: string, filters: {
    status?: string;
    period?: string;
  } = {}) {
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

    const query: Record<string, any> = {
      'items.productId': { $in: productIds }
    };

    if (filters.period) {
      const startDate = getStartDateFromPeriod(filters.period);
      query.createdAt = { $gte: startDate };
    }

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
  }

  async bulkUpdateOrders(sellerId: string, orderIds: string[], updates: any) {
    const productIds = await this.getSellerProductIds(sellerId);

    const orders = await Order.find({
      _id: { $in: orderIds },
      'items.productId': { $in: productIds }
    });

    if (orders.length !== orderIds.length) {
      throw new BulkOrderUpdateError('Some orders not found or unauthorized');
    }

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
  }

  async getOrdersExportData(sellerId: string, filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
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
  }

  async updateOrderTracking(sellerId: string, orderId: string, trackingData: {
    trackingNumber: string;
    carrier?: string;
  }) {
    const order = await Order.findById(orderId).populate('items.productId', 'sellerId');
    if (!order) {
      throw new OrderNotFoundError(orderId);
    }

    const hasSellerItems = order.items.some((item: any) => {
      const itemSellerId = item.sellerId?.toString() || item.productId?.sellerId?.toString();
      return itemSellerId === sellerId;
    });

    if (!hasSellerItems) {
      throw new UnauthorizedOrderAccessError();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { 
        $set: { 
          trackingNumber: trackingData.trackingNumber,
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: false }
    );

    return updatedOrder;
  }

  async addOrderNotes(sellerId: string, orderId: string, notesData: {
    notes: string;
  }) {
    const order = await Order.findById(orderId).populate('items.productId', 'sellerId');
    if (!order) {
      throw new OrderNotFoundError(orderId);
    }

    const hasSellerItems = order.items.some((item: any) => {
      const itemSellerId = item.sellerId?.toString() || item.productId?.sellerId?.toString();
      return itemSellerId === sellerId;
    });

    if (!hasSellerItems) {
      throw new UnauthorizedOrderAccessError();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { 
        $set: { 
          notes: notesData.notes,
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: false }
    );

    return updatedOrder;
  }

  async cancelOrder(sellerId: string, orderId: string, cancelData: {
    reason: string;
  }) {
    const order = await Order.findById(orderId).populate('items.productId', 'sellerId');
    if (!order) {
      throw new OrderNotFoundError(orderId);
    }

    const hasSellerItems = order.items.some((item: any) => {
      const itemSellerId = item.sellerId?.toString() || item.productId?.sellerId?.toString();
      return itemSellerId === sellerId;
    });

    if (!hasSellerItems) {
      throw new UnauthorizedOrderAccessError();
    }

    if (['delivered', 'cancelled'].includes(order.orderStatus)) {
      throw new OrderUpdateError(`Cannot cancel order with status: ${order.orderStatus}`);
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { 
        $set: { 
          orderStatus: 'cancelled',
          cancellationReason: cancelData.reason,
          cancelledAt: new Date(),
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: false }
    );

    return updatedOrder;
  }
}

export const sellerOrdersRepository = new SellerOrdersRepository();