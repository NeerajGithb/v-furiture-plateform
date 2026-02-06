import { BasePrivateService } from "../baseService";
import { 
  SellerOrder,
  OrdersQuery,
  OrderStatusUpdate,
  OrderTrackingUpdate,
  OrderNotes,
  OrderCancel,
  BulkOrderUpdate,
  ExportOrdersOptions
} from "@/types/sellerOrder";

interface OrdersResponse {
  orders: SellerOrder[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats?: any;
}

class SellerOrdersService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  // Get seller orders with pagination and filters
  async getOrders(params: OrdersQuery = {}): Promise<OrdersResponse> {
    const response = await this.get<OrdersResponse>("/seller/orders", params);

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch orders.",
      );
    }
  }

  // Get order statistics
  async getOrderStats(period?: string): Promise<any> {
    const params = period ? { action: "stats", period } : { action: "stats" };
    const response = await this.get<{ stats: any }>("/seller/orders", params);

    if (response.success) {
      return response.data!.stats;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch order statistics.",
      );
    }
  }

  // Get single order by ID
  async getOrderById(orderId: string): Promise<SellerOrder> {
    const response = await this.get<{ order: SellerOrder }>(`/seller/orders/${orderId}`);

    if (response.success) {
      return response.data!.order;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch order.",
      );
    }
  }

  // Update order status
  async updateOrderStatus(orderId: string, data: OrderStatusUpdate): Promise<void> {
    const response = await this.patch(`/seller/orders/${orderId}`, {
      action: "updateStatus",
      ...data,
    });

    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to update order status.",
      );
    }
  }

  // Update order tracking
  async updateOrderTracking(orderId: string, data: OrderTrackingUpdate): Promise<void> {
    const response = await this.patch(`/seller/orders/${orderId}`, {
      action: "updateTracking",
      ...data,
    });

    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to update tracking information.",
      );
    }
  }

  // Add order notes
  async addOrderNotes(orderId: string, data: OrderNotes): Promise<void> {
    const response = await this.patch(`/seller/orders/${orderId}`, {
      action: "addNotes",
      ...data,
    });

    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to add order notes.",
      );
    }
  }

  // Cancel order
  async cancelOrder(orderId: string, data: OrderCancel): Promise<void> {
    const response = await this.patch(`/seller/orders/${orderId}`, {
      action: "cancel",
      ...data,
    });

    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to cancel order.",
      );
    }
  }

  // Bulk update orders
  async bulkUpdateOrders(data: BulkOrderUpdate): Promise<{ message: string }> {
    const response = await this.patch<{ message: string }>("/seller/orders", {
      action: "bulk",
      ...data,
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to bulk update orders.",
      );
    }
  }

  // Export orders
  async exportOrders(options: ExportOrdersOptions): Promise<any> {
    const response = await this.get("/seller/orders", { action: "export", ...options });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to export orders.",
      );
    }
  }
}

// Export singleton instance
export const sellerOrdersService = new SellerOrdersService();