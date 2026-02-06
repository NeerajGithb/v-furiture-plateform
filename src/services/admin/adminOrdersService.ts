import { BasePrivateService } from "../baseService";
import { 
  AdminOrdersQuery,
  AdminOrderUpdate,
  AdminOrderBulkUpdate,
  AdminOrderBulkUpdateResponse,
  AdminOrder,
  OrderStats
} from '@/types/order';

class AdminOrdersService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  // Get orders with filters - matches useAdminOrders hook
  async getOrders(params: AdminOrdersQuery = {}) {
    const response = await this.get("/admin/orders", {
      action: "list",
      ...params,
    });

    if (response.success) {
      return response.data;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch orders.",
      );
    }
  }

  // Get order statistics - matches useAdminOrderStats hook
  async getOrderStats(period?: string) {
    const response = await this.get("/admin/orders", {
      action: "stats",
      period,
    });

    if (response.success) {
      return response.data;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch order statistics.",
      );
    }
  }

  // Get single order by ID - matches useAdminOrder hook
  async getOrderById(orderId: string): Promise<AdminOrder> {
    const response = await this.get(`/admin/orders/${orderId}`);

    if (response.success) {
      return response.data as AdminOrder;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch order details.",
      );
    }
  }

  // Update order - matches useUpdateAdminOrder hook
  async updateOrder(orderId: string, data: AdminOrderUpdate): Promise<AdminOrder> {
    const response = await this.patch(`/admin/orders/${orderId}`, data);

    if (response.success) {
      return response.data as AdminOrder;
    } else {
      throw new Error(
        response.error?.message || "Failed to update order.",
      );
    }
  }

  // Delete order - matches useDeleteAdminOrder hook
  async deleteOrder(orderId: string): Promise<void> {
    const response = await this.delete(`/admin/orders/${orderId}`);

    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to delete order.",
      );
    }
  }

  // Bulk update orders - matches useBulkUpdateAdminOrders hook
  async bulkUpdateOrders(data: AdminOrderBulkUpdate): Promise<AdminOrderBulkUpdateResponse> {
    const response = await this.patch("/admin/orders", {
      action: "bulk-update",
      ...data,
    });

    if (response.success) {
      return response.data as AdminOrderBulkUpdateResponse;
    } else {
      throw new Error(
        response.error?.message || "Failed to bulk update orders.",
      );
    }
  }

  // Export orders - matches useExportAdminOrders hook
  async exportOrders(options: any): Promise<Blob> {
    const response = await this.get("/admin/orders", {
      action: "export",
      format: 'csv',
      ...options,
    });

    if (response.success) {
      // Create download link
      const blob = new Blob([JSON.stringify(response.data)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return blob;
    } else {
      throw new Error(
        response.error?.message || "Failed to export orders.",
      );
    }
  }
}

// Export singleton instance
export const adminOrdersService = new AdminOrdersService();