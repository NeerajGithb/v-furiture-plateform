import { sellerInventoryRepository } from "./SellerInventoryRepository";
import { 
  SellerInventoryQueryRequest, 
  BulkUpdateInventoryRequest, 
  InventoryExportRequest,
  StockUpdateRequest 
} from "./SellerInventorySchemas";
import { InvalidUpdateDataError } from "./SellerInventoryErrors";

export class SellerInventoryService {
  async getInventoryData(sellerId: string, query: SellerInventoryQueryRequest = {}) {
    const { page = 1, limit = 20, action } = query;

    // Handle specific actions
    if (action === 'stats') {
      const stats = await sellerInventoryRepository.getInventoryStats(sellerId, {
        search: query.search,
        status: query.status,
        period: query.period,
      });
      return { stats };
    }

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

  async getInventoryStats(sellerId: string, filters: {
    search?: string;
    status?: string;
    period?: string;
  } = {}) {
    return await sellerInventoryRepository.getInventoryStats(sellerId, filters);
  }
}

export const sellerInventoryService = new SellerInventoryService();