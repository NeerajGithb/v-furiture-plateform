import { sellerOrdersRepository } from "./SellerOrdersRepository";
import { 
  SellerOrdersQueryRequest, 
  OrderStatusUpdateRequest, 
  BulkOrderUpdateRequest,
  OrderExportRequest,
  OrderTrackingUpdateRequest,
  OrderNotesRequest,
  OrderCancelRequest
} from "./SellerOrdersSchemas";
import { InvalidOrderStatusError } from "./SellerOrdersErrors";

export class SellerOrdersService {
  private readonly validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

  async getOrdersData(sellerId: string, query: SellerOrdersQueryRequest) {
    const { page = 1, limit = 20, action } = query;

    // Handle specific actions
    if (action === 'stats') {
      const stats = await sellerOrdersRepository.getOrdersStats(sellerId, {
        status: query.status,
        period: query.period,
      });
      return { stats };
    }

    // Get orders list with stats
    const [ordersResult, stats] = await Promise.all([
      sellerOrdersRepository.getOrdersList(sellerId, {
        page,
        limit,
        search: query.search,
        status: query.status,
        period: query.period,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      }),
      sellerOrdersRepository.getOrdersStats(sellerId, {
        status: query.status,
        period: query.period,
      })
    ]);

    return {
      orders: ordersResult.orders,
      stats,
      pagination: {
        page,
        limit,
        total: ordersResult.total,
        totalPages: Math.ceil(ordersResult.total / limit),
        hasNext: page < Math.ceil(ordersResult.total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async getOrderById(sellerId: string, orderId: string) {
    return await sellerOrdersRepository.getOrderById(sellerId, orderId);
  }

  async updateOrderStatus(sellerId: string, orderId: string, updates: OrderStatusUpdateRequest) {
    if (!this.validStatuses.includes(updates.status)) {
      throw new InvalidOrderStatusError(updates.status);
    }

    return await sellerOrdersRepository.updateOrderStatus(sellerId, orderId, updates);
  }

  async bulkUpdateOrders(sellerId: string, bulkData: BulkOrderUpdateRequest) {
    const { orderIds, updates } = bulkData;

    if (updates.orderStatus && !this.validStatuses.includes(updates.orderStatus)) {
      throw new InvalidOrderStatusError(updates.orderStatus);
    }

    return await sellerOrdersRepository.bulkUpdateOrders(sellerId, orderIds, updates);
  }

  async exportOrders(sellerId: string, exportOptions: OrderExportRequest) {
    const { format, status, startDate, endDate } = exportOptions;
    
    const data = await sellerOrdersRepository.getOrdersExportData(sellerId, {
      status,
      startDate,
      endDate,
    });

    if (format === 'json') {
      return {
        format: 'json',
        data,
        filename: `orders-export-${new Date().toISOString().split('T')[0]}.json`
      };
    }

    // Generate CSV content
    const headers = [
      'Order Number',
      'Customer Name',
      'Customer Email',
      'Total Amount',
      'Order Status',
      'Payment Status',
      'Shipping Address',
      'Order Date'
    ];

    const csvRows = [
      headers.join(','),
      ...data.map((row: any) => [
        `"${row.orderNumber}"`,
        `"${row.customerName}"`,
        `"${row.customerEmail}"`,
        row.totalAmount,
        row.orderStatus,
        row.paymentStatus,
        `"${row.shippingAddress}"`,
        row.orderDate
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');

    return {
      format: 'csv',
      content: csvContent,
      filename: `orders-export-${new Date().toISOString().split('T')[0]}.csv`
    };
  }

  async getOrdersStats(sellerId: string, filters: {
    status?: string;
    period?: string;
  } = {}) {
    return await sellerOrdersRepository.getOrdersStats(sellerId, filters);
  }

  async updateOrderTracking(sellerId: string, orderId: string, trackingData: OrderTrackingUpdateRequest) {
    return await sellerOrdersRepository.updateOrderTracking(sellerId, orderId, trackingData);
  }

  async addOrderNotes(sellerId: string, orderId: string, notesData: OrderNotesRequest) {
    return await sellerOrdersRepository.addOrderNotes(sellerId, orderId, notesData);
  }

  async cancelOrder(sellerId: string, orderId: string, cancelData: OrderCancelRequest) {
    return await sellerOrdersRepository.cancelOrder(sellerId, orderId, cancelData);
  }
}

export const sellerOrdersService = new SellerOrdersService();