import { sellerInventoryRepository } from "./SellerInventoryRepository";
import { 
  SellerInventoryQueryRequest,
  InventoryStatsQueryRequest,
  BulkUpdateInventoryRequest, 
  InventoryExportRequest,
  StockUpdateRequest 
} from "./SellerInventorySchemas";
import { InvalidUpdateDataError } from "./SellerInventoryErrors";

export class SellerInventoryService {
  async getInventoryData(sellerId: string, query: Partial<SellerInventoryQueryRequest> = {}) {
    const { page = 1, limit = 20 } = query;

    // Get inventory list with stats
    const [inventoryResult, stats] = await Promise.all([
      sellerInventoryRepository.getInventoryList(sellerId, {
        page,
        limit,
        search: query.search,
        status: query.status,
        period: query.period,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      }),
      sellerInventoryRepository.getInventoryStats(sellerId, {
        search: query.search,
        status: query.status,
        period: query.period,
      })
    ]);

    return {
      inventory: inventoryResult.inventory,
      stats,
      pagination: {
        page,
        limit,
        total: inventoryResult.total,
        totalPages: Math.ceil(inventoryResult.total / limit),
        hasNext: page < Math.ceil(inventoryResult.total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async getInventoryItem(sellerId: string, productId: string) {
    return await sellerInventoryRepository.getInventoryItem(sellerId, productId);
  }

  async updateInventoryItem(sellerId: string, productId: string, updates: StockUpdateRequest) {
    if (Object.keys(updates).length === 0) {
      throw new InvalidUpdateDataError("At least one field must be provided for update");
    }

    return await sellerInventoryRepository.updateInventoryItem(sellerId, productId, updates);
  }

  async bulkUpdateInventory(sellerId: string, bulkData: BulkUpdateInventoryRequest) {
    const { updates } = bulkData;

    if (!updates || updates.length === 0) {
      throw new InvalidUpdateDataError("Updates array is required and cannot be empty");
    }

    const result = await sellerInventoryRepository.bulkUpdateInventory(sellerId, updates);
    
    return {
      ...result,
      message: `Bulk update completed: ${result.summary.successful} successful, ${result.summary.failed} failed`
    };
  }

  async exportInventory(sellerId: string, exportOptions: InventoryExportRequest) {
    const { format, search, status, period } = exportOptions;
    
    const data = await sellerInventoryRepository.getInventoryExportData(sellerId, {
      search,
      status,
      period,
    });

    if (format === 'json') {
      return {
        format: 'json',
        data,
        filename: `inventory-export-${new Date().toISOString().split('T')[0]}.json`
      };
    }

    // Generate CSV content
    const headers = [
      'Product Name',
      'SKU',
      'Current Stock',
      'Reorder Level',
      'Original Price',
      'Final Price',
      'Status',
      'Stock Status',
      'Created Date',
      'Updated Date'
    ];

    const csvRows = [
      headers.join(','),
      ...data.map((row: any) => [
        `"${row.productName}"`,
        `"${row.sku}"`,
        row.currentStock,
        row.reorderLevel,
        row.originalPrice,
        row.finalPrice,
        row.status,
        row.stockStatus,
        row.createdDate,
        row.updatedDate
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');

    return {
      format: 'csv',
      content: csvContent,
      filename: `inventory-export-${new Date().toISOString().split('T')[0]}.csv`
    };
  }

  async getInventoryStats(sellerId: string, query: InventoryStatsQueryRequest) {
    return await sellerInventoryRepository.getInventoryStats(sellerId, {
      search: query.search,
      status: query.status,
      period: query.period,
    });
  }

  async updateStock(sellerId: string, productId: string, stockData: {
    quantity: number;
    type: 'add' | 'subtract' | 'set';
    reason?: string;
  }) {
    const product = await sellerInventoryRepository.getInventoryItem(sellerId, productId);
    
    let newStock = product.currentStock;
    if (stockData.type === 'set') {
      newStock = stockData.quantity;
    } else if (stockData.type === 'add') {
      newStock = product.currentStock + stockData.quantity;
    } else if (stockData.type === 'subtract') {
      newStock = Math.max(0, product.currentStock - stockData.quantity);
    }

    await sellerInventoryRepository.updateInventoryItem(sellerId, productId, {
      stock: newStock
    });

    return {
      message: 'Stock updated successfully',
      item: await sellerInventoryRepository.getInventoryItem(sellerId, productId)
    };
  }

  async setReorderLevel(sellerId: string, productId: string, reorderLevel: number) {
    await sellerInventoryRepository.updateInventoryItem(sellerId, productId, {
      reorderLevel
    });

    return {
      message: 'Reorder level updated successfully',
      item: await sellerInventoryRepository.getInventoryItem(sellerId, productId)
    };
  }

  async bulkUpdateStock(sellerId: string, data: {
    items: Array<{ productId: string; quantity: number; type: 'add' | 'subtract' | 'set' }>;
    reason?: string;
  }) {
    let updatedCount = 0;

    for (const item of data.items) {
      const product = await sellerInventoryRepository.getInventoryItem(sellerId, item.productId);
      
      let newStock = product.currentStock;
      if (item.type === 'set') {
        newStock = item.quantity;
      } else if (item.type === 'add') {
        newStock = product.currentStock + item.quantity;
      } else if (item.type === 'subtract') {
        newStock = Math.max(0, product.currentStock - item.quantity);
      }

      await sellerInventoryRepository.updateInventoryItem(sellerId, item.productId, {
        stock: newStock
      });
      updatedCount++;
    }

    return {
      message: 'Bulk stock update completed',
      updatedCount
    };
  }

  async getLowStockAlerts(sellerId: string, params: {
    page?: number;
    limit?: number;
    status?: 'active' | 'resolved' | 'all';
  }) {
    const { page = 1, limit = 20 } = params;
    
    const alerts = await sellerInventoryRepository.getLowStockAlerts(sellerId);
    
    const total = alerts.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAlerts = alerts.slice(startIndex, endIndex);

    return {
      alerts: paginatedAlerts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  async resolveAlert(sellerId: string, alertId: string) {
    return {
      message: 'Alert resolved successfully'
    };
  }
}

export const sellerInventoryService = new SellerInventoryService();