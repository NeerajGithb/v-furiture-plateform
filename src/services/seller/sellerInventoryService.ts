import { BasePrivateService } from "../baseService";
import { 
  InventoryItem,
  InventoryQuery,
  UpdateInventoryRequest,
  BulkInventoryUpdate,
  InventoryStats,
  StockHistoryEntry,
  LowStockAlert,
  StockUpdateData,
  BulkStockUpdateData
} from "@/types/sellerInventory";

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

interface InventoryStatsResponse {
  stats: InventoryStats;
}

interface StockHistoryResponse {
  history: StockHistoryEntry[];
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
  async getInventory(params: InventoryQuery = {}): Promise<InventoryResponse> {
    const response = await this.post<InventoryResponse>("/seller/inventory", {
      action: "list",
      ...params
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch inventory.",
      );
    }
  }

  // Get inventory statistics
  async getInventoryStats(period?: string): Promise<InventoryStats> {
    const response = await this.post<InventoryStatsResponse>("/seller/inventory", {
      action: "stats",
      period
    });

    if (response.success) {
      return response.data!.stats;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch inventory statistics.",
      );
    }
  }

  // Get single inventory item by product ID
  async getInventoryItem(productId: string): Promise<InventoryItem> {
    const response = await this.post<{ item: InventoryItem }>("/seller/inventory", {
      action: "get_item",
      productId
    });

    if (response.success) {
      return response.data!.item;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch inventory item.",
      );
    }
  }

  // Update stock for a single product
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

  // Bulk update stock for multiple products
  async bulkUpdateStock(data: BulkStockUpdateData): Promise<{ message: string; updatedCount: number }> {
    const response = await this.post<{ message: string; updatedCount: number }>("/seller/inventory", {
      action: "bulk_update_stock",
      ...data
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to bulk update stock.",
      );
    }
  }

  // Get stock history for a product
  async getStockHistory(productId: string, params: { page?: number; limit?: number } = {}): Promise<StockHistoryResponse> {
    const response = await this.post<StockHistoryResponse>("/seller/inventory", {
      action: "stock_history",
      productId,
      ...params
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch stock history.",
      );
    }
  }

  // Get low stock alerts
  async getLowStockAlerts(params: { page?: number; limit?: number; status?: 'active' | 'resolved' | 'all' } = {}): Promise<LowStockAlertsResponse> {
    const response = await this.post<LowStockAlertsResponse>("/seller/inventory", {
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

  // Resolve low stock alert
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

  // Export inventory data
  async exportInventory(params: {
    status?: string;
    search?: string;
    format?: 'csv' | 'xlsx';
    includeHistory?: boolean;
  } = {}): Promise<{ downloadUrl: string; message: string }> {
    const response = await this.post<{ downloadUrl: string; message: string }>("/seller/inventory", {
      action: "export",
      format: 'xlsx',
      ...params
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to export inventory.",
      );
    }
  }

  // Update inventory item (legacy method for backward compatibility)
  async updateInventoryItem(productId: string, data: UpdateInventoryRequest): Promise<any> {
    const response = await this.post("/seller/inventory", {
      action: "update_item",
      productId,
      ...data
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to update inventory item.",
      );
    }
  }

  // Bulk update inventory (legacy method for backward compatibility)
  async bulkUpdateInventory(data: BulkInventoryUpdate): Promise<{ message: string }> {
    const response = await this.post<{ message: string }>("/seller/inventory", {
      action: "bulk_update",
      ...data,
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to bulk update inventory.",
      );
    }
  }
}

// Export singleton instance
export const sellerInventoryService = new SellerInventoryService();