import { BasePrivateService } from "../baseService";
import {
  AdminOrdersQueryRequest,
  AdminOrder,
  OrderStats,
} from '@/types/admin/orders';
import { PaginationResult } from '@/lib/domain/shared/types';

class AdminOrdersService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  async getOrders(params: Partial<AdminOrdersQueryRequest>): Promise<PaginationResult<AdminOrder>> {
    return this.getPaginated<AdminOrder>("/admin/orders", params);
  }

  async getOrderStats(period?: string): Promise<OrderStats> {
    const response = await this.get("/admin/orders", {
      stats: "true",
      period,
    });

    if (response.success) {
      return response.data as OrderStats;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch order statistics.",
      );
    }
  }

  async exportOrders(options: { format?: string; filters?: any }): Promise<Blob> {
    const response = await this.post("/admin/orders", {
      action: "export",
      format: 'csv',
      ...options,
    });

    if (response.success) {
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

export const adminOrdersService = new AdminOrdersService();
