import { BasePrivateService } from "../baseService";
import { 
  SellerOrder,
  OrdersQuery,
  OrderStatusUpdate,
  OrderTrackingUpdate,
  OrderNotes,
  OrderCancel,
  BulkOrderUpdate,
  ExportOrdersOptions,
  OrderStats
} from "@/types/seller/orders";

interface OrdersResponse {
  orders: SellerOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class SellerOrdersService extends BasePrivateService {
  constructor() {
    super("/api/seller");
  }

  async getOrders(params: Partial<OrdersQuery> = {}): Promise<OrdersResponse> {
    const result = await this.getPaginated<SellerOrder>("/orders", params);
    return {
      orders: result.data,
      pagination: result.pagination
    };
  }

  async getOrderStats(period?: string): Promise<OrderStats> {
    const params: any = { stats: "true" };
    if (period) params.period = period;
    
    const response = await this.get<OrderStats>("/orders", params);

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch order statistics.",
      );
    }
  }

  async getOrderById(orderId: string): Promise<SellerOrder> {
    const response = await this.get<{ order: SellerOrder }>(`/orders/${orderId}`);

    if (response.success) {
      return response.data!.order;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch order.",
      );
    }
  }

  async updateOrderStatus(orderId: string, data: OrderStatusUpdate): Promise<{ message: string }> {
    const response = await this.post<{ message: string }>(`/orders/${orderId}`, {
      action: "updateStatus",
      ...data,
    });

    if (response.success) {
      return {
        message: (response as { meta?: { message?: string } }).meta?.message || 'Order status updated successfully'
      };
    } else {
      throw new Error(
        response.error?.message || "Failed to update order status.",
      );
    }
  }

  async updateOrderTracking(orderId: string, data: OrderTrackingUpdate): Promise<{ message: string }> {
    const response = await this.post<{ message: string }>(`/orders/${orderId}`, {
      action: "updateTracking",
      ...data,
    });

    if (response.success) {
      return {
        message: (response as { meta?: { message?: string } }).meta?.message || 'Tracking information updated successfully'
      };
    } else {
      throw new Error(
        response.error?.message || "Failed to update tracking information.",
      );
    }
  }

  async addOrderNotes(orderId: string, data: OrderNotes): Promise<{ message: string }> {
    const response = await this.post<{ message: string }>(`/orders/${orderId}`, {
      action: "addNotes",
      ...data,
    });

    if (response.success) {
      return {
        message: (response as { meta?: { message?: string } }).meta?.message || 'Notes added successfully'
      };
    } else {
      throw new Error(
        response.error?.message || "Failed to add order notes.",
      );
    }
  }

  async cancelOrder(orderId: string, data: OrderCancel): Promise<{ message: string }> {
    const response = await this.post<{ message: string }>(`/orders/${orderId}`, {
      action: "cancel",
      ...data,
    });

    if (response.success) {
      return {
        message: (response as { meta?: { message?: string } }).meta?.message || 'Order cancelled successfully'
      };
    } else {
      throw new Error(
        response.error?.message || "Failed to cancel order.",
      );
    }
  }

  async bulkUpdateOrders(data: BulkOrderUpdate): Promise<{ message: string }> {
    const response = await this.post<{ message: string }>("/orders?action=bulk-update", data);

    if (response.success) {
      return {
        message: (response as { meta?: { message?: string } }).meta?.message || 'Orders updated successfully'
      };
    } else {
      throw new Error(
        response.error?.message || "Failed to bulk update orders.",
      );
    }
  }

  async exportOrders(options: ExportOrdersOptions): Promise<{ downloadUrl: string; message: string }> {
    const response = await this.get<{ downloadUrl: string }>("/orders", { 
      action: "export", 
      ...options 
    });

    if (response.success) {
      return {
        downloadUrl: response.data!.downloadUrl,
        message: (response as { meta?: { message?: string } }).meta?.message || 'Orders exported successfully'
      };
    } else {
      throw new Error(
        response.error?.message || "Failed to export orders.",
      );
    }
  }
}

export const sellerOrdersService = new SellerOrdersService();