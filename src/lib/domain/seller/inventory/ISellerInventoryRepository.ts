export interface InventoryItem {
  id: string;
  productId: {
    id: string;
    name: string;
    mainImage?: {
      url: string;
      publicId?: string;
    };
  };
  sku: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  reorderLevel: number;
  maxStock: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  lastRestocked?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryStats {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  discontinued: number;
  totalValue: number;
  totalQuantity?: number;
  avgPrice?: number;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  orderId?: string;
  createdAt: Date;
  createdBy: string;
}

export interface BulkStockUpdate {
  productId: string;
  quantity: number;
  type: 'set' | 'add' | 'subtract';
  reason?: string;
}

export interface ISellerInventoryRepository {
  // Inventory overview
  getInventoryStats(sellerId: string): Promise<InventoryStats>;
  getInventoryItems(sellerId: string, options: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{
    items: InventoryItem[];
    total: number;
  }>;
  
  // Stock management
  updateStock(sellerId: string, productId: string, quantity: number, reason: string): Promise<InventoryItem>;
  bulkUpdateStock(sellerId: string, updates: BulkStockUpdate[]): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }>;
  
  // Stock movements
  getStockMovements(sellerId: string, options: {
    page: number;
    limit: number;
    productId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    movements: StockMovement[];
    total: number;
  }>;
  
  // Alerts
  getLowStockAlerts(sellerId: string): Promise<InventoryItem[]>;
  updateReorderLevel(sellerId: string, productId: string, reorderLevel: number): Promise<InventoryItem>;
}