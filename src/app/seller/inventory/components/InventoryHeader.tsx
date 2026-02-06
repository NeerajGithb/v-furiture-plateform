'use client';

import { Download } from 'lucide-react';
import { InventoryHeaderProps, StockUpdateType } from '@/types/sellerInventory';

export default function InventoryHeader({
  selectedItems,
  onBulkStockUpdate,
  onExport,
  bulkUpdateStock,
  exportInventory
}: InventoryHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your product stock levels</p>
      </div>

      <div className="flex items-center gap-3">
        {selectedItems.length > 0 && (
          <div className="flex items-center gap-2 mr-2">
            <span className="text-sm font-medium text-gray-600 border-r border-gray-200 pr-3 mr-1">{selectedItems.length} selected</span>
            <button
              onClick={() => onBulkStockUpdate('add' as StockUpdateType, 10)}
              disabled={bulkUpdateStock.isPending}
              className="px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              +10 Stock
            </button>
            <button
              onClick={() => onBulkStockUpdate('subtract' as StockUpdateType, 1)}
              disabled={bulkUpdateStock.isPending}
              className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              -1 Stock
            </button>
          </div>
        )}
        <button
          onClick={onExport}
          disabled={exportInventory.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          {exportInventory.isPending ? 'Exporting...' : 'Export'}
        </button>
      </div>
    </div>
  );
}