// Seller Inventory Types
export type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
export type StockUpdateType = 'add' | 'subtract' | 'set';

export interface InventoryProduct {
  _id: string;
  name: string;
  mainImage?: { 
    url: string; 
    alt?: string; 
  };
  sku?: string;
}

export interface InventoryItem {
  _id: string;
  productId: InventoryProduct;
  sku: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  reorderLevel: number;
  maxStock: number;
  status: InventoryStatus;
  lastRestocked?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStats {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  discontinued: number;
  totalValue: number;
}

export interface InventoryResponse {
  inventory: InventoryItem[];
  stats?: InventoryStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface InventoryFilters {
  status?: InventoryStatus;
  search?: string;
  period?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface InventoryQuery {
  status?: InventoryStatus;
  search?: string;
  period?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateInventoryRequest {
  quantity?: number;
  reorderLevel?: number;
  maxStock?: number;
  status?: InventoryStatus;
}

export interface BulkInventoryUpdate {
  items: BulkStockUpdateItem[];
  reason?: string;
}

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

// UI State interfaces
export interface InventoryUIState {
  editingStock: { [productId: string]: number };
  editingReorderLevel: { [productId: string]: number };
  selectedItems: string[];
  showFilters: boolean;
  setEditingStock: (productId: string, value: number) => void;
  clearEditingStock: (productId: string) => void;
  clearAllEditingStock: () => void;
  setEditingReorderLevel: (productId: string, value: number) => void;
  clearEditingReorderLevel: (productId: string) => void;
  clearAllEditingReorderLevel: () => void;
  toggleItemSelection: (productId: string) => void;
  selectAllItems: (productIds: string[]) => void;
  clearSelection: () => void;
  setShowFilters: (show: boolean) => void;
  resetState: () => void;
}

// Component Props interfaces
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

export interface InventoryFiltersProps {
  filterStatus: string;
  setFilterStatus: (status?: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

export interface InventoryTableProps {
  inventory: InventoryItem[];
  selectedItems: string[];
  editingStock: { [productId: string]: number };
  editingReorderLevel: { [productId: string]: number };
  onToggleItemSelection: (productId: string) => void;
  onSelectAllItems: () => void;
  onClearSelection: () => void;
  onStockUpdate: (productId: string, newStock: number, type?: StockUpdateType) => void;
  onReorderLevelUpdate: (productId: string, reorderLevel: number) => void;
  setEditingStock: (productId: string, value: number) => void;
  setEditingReorderLevel: (productId: string, value: number) => void;
  updateStock: any;
  setReorderLevel: any;
}

export interface InventoryPaginationProps {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Stock Management interfaces
export interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (type: StockUpdateType, quantity: number, reason: string) => void;
  currentStock: number;
  productName: string;
  updating: boolean;
}

export interface BulkStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (type: StockUpdateType, quantity: number, reason: string) => void;
  selectedCount: number;
  updating: boolean;
}

export interface ReorderLevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reorderLevel: number) => void;
  currentLevel: number;
  productName: string;
  updating: boolean;
}

// Stock History interfaces
export interface StockHistoryEntry {
  _id: string;
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

// Low Stock Alert interfaces
export interface LowStockAlert {
  _id: string;
  productId: InventoryProduct;
  currentStock: number;
  reorderLevel: number;
  status: 'active' | 'resolved';
  createdAt: string;
}

export interface LowStockAlertsProps {
  alerts: LowStockAlert[];
  onResolve: (alertId: string) => void;
}