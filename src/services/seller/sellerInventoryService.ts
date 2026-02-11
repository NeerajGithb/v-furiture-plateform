import { BasePrivateService } from "../baseService";
import { 
  InventoryItem,
  InventoryQuery,
  InventoryStats,
  LowStockAlert,
  StockUpdateData
} from "@/types/seller/inventory";

interface InventoryResponse {
  inventory: InventoryItem[];
  stats?: InventoryStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface LowStockAlertsResponse {
  alerts: LowStockAlert[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class SellerInventoryService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  // Get inventory items with pagination and filters
  async getInventory(params: Partial<InventoryQuery> = {}): Promise<InventoryResponse> {
    const result = await this.getPaginated<InventoryItem>("/seller/inventory", params);
    
    return {
      inventory: result.data,
      pagination: {
        page: result.pagination?.page || 1,
        limit: result.pagination?.limit || 20,
        total: result.pagination?.total || 0,
        pages: result.pagination?.totalPages || 0,
      },
    };
  }

  // Get inventory statistics
  async getInventoryStats(period?: string): Promise<InventoryStats> {
    const params: any = { stats: "true" };
    if (period) params.period = period;
    
    const response: any = await this.get("/seller/inventory", params);

    if (response.success) {
      return response.data as InventoryStats;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch inventory statistics.",
      );
    }
  }

  async updateStock(productId: string, stockData: StockUpdateData): Promise<{ message: string; item: InventoryItem }> {
    const response = await this.post<{ message: string; item: InventoryItem }>("/seller/inventory", {
      action: "update_stock",
      productId,
      ...stockData
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to update stock.",
      );
    }
  }

  // Set reorder level for a product
  async setReorderLevel(productId: string, reorderLevel: number): Promise<{ message: string; item: InventoryItem }> {
    const response = await this.post<{ message: string; item: InventoryItem }>("/seller/inventory", {
      action: "set_reorder_level",
      productId,
      reorderLevel
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to set reorder level.",
      );
    }
  }

  async getLowStockAlerts(params: { page?: number; limit?: number; status?: 'active' | 'resolved' | 'all' } = {}): Promise<LowStockAlertsResponse> {
    const response = await this.get<LowStockAlertsResponse>("/seller/inventory", {
      action: "low_stock_alerts",
      ...params
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch low stock alerts.",
      );
    }
  }

  async resolveLowStockAlert(alertId: string): Promise<{ message: string }> {
    const response = await this.post<{ message: string }>("/seller/inventory", {
      action: "resolve_alert",
      alertId
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to resolve alert.",
      );
    }
  }
}

export const sellerInventoryService = new SellerInventoryService();