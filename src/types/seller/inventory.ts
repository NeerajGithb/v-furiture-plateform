import type {
  InventoryItem,
  InventoryStats,
  StockMovement,
  BulkStockUpdate,
} from '@/lib/domain/seller/inventory/ISellerInventoryRepository';

import type {
  SellerInventoryQueryRequest as InventoryQuery,
  BulkUpdateInventoryRequest as BulkInventoryUpdate,
  InventoryExportRequest as ExportOptions,
  StockUpdateRequest as UpdateInventoryRequest,
} from '@/lib/domain/seller/inventory/SellerInventorySchemas';

export type {
  InventoryItem,
  InventoryStats,
  StockMovement,
  BulkStockUpdate,
};

export type {
  InventoryQuery,
  BulkInventoryUpdate,
  ExportOptions,
  UpdateInventoryRequest,
};

export type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
export type StockUpdateType = 'add' | 'subtract' | 'set';

export interface StockUpdateData {
  quantity: number;
  type: StockUpdateType;
  reason?: string;
}

export interface BulkStockUpdateItem {
  productId: string;
  quantity: number;
  type: StockUpdateType;
}

export interface BulkStockUpdateData {
  items: BulkStockUpdateItem[];
  reason?: string;
}

export interface StockHistoryEntry {
  id: string;
  productId: string;
  type: StockUpdateType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  createdBy: string;
  createdAt: string;
}

export interface StockHistoryProps {
  productId: string;
  history: StockHistoryEntry[];
}

export interface LowStockAlert {
  id: string;
  productId: {
    id: string;
    name: string;
    mainImage?: { url: string };
  };
  currentStock: number;
  reorderLevel: number;
  status: 'active' | 'resolved';
  createdAt: string;
}

export interface LowStockAlertsProps {
  alerts: LowStockAlert[];
  onResolve: (alertId: string) => void;
}

export interface InventoryHeaderProps {
  selectedItems: string[];
  onBulkStockUpdate: (type: StockUpdateType, quantity: number) => void;
  onExport: () => void;
  bulkUpdateStock: any;
  exportInventory: any;
}

export interface InventoryStatsProps {
  stats?: InventoryStats;
}