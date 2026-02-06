'use client';

import { useState } from 'react';
import { Package, AlertTriangle, Edit2, Plus, Minus, Check, X, TrendingUp, TrendingDown } from 'lucide-react';
import { InventoryItem, StockUpdateType } from '@/types/sellerInventory';

interface InventoryTableProps {
  inventory: InventoryItem[];
  selectedItems: string[];
  onToggleItemSelection: (productId: string) => void;
  onSelectAllItems: () => void;
  onClearSelection: () => void;
  onStockUpdate: (productId: string, quantity: number, type?: StockUpdateType, reason?: string) => void;
  onReorderLevelUpdate: (productId: string, reorderLevel: number) => void;
  updateStock: any;
  setReorderLevel: any;
  getStockBadge: (status: string) => string;
}

export default function InventoryTable({
  inventory,
  selectedItems,
  onToggleItemSelection,
  onSelectAllItems,
  onClearSelection,
  onStockUpdate,
  onReorderLevelUpdate,
  updateStock,
  setReorderLevel,
  getStockBadge
}: InventoryTableProps) {
  const [editingStock, setEditingStock] = useState<{ [productId: string]: number }>({});
  const [editingReorderLevel, setEditingReorderLevel] = useState<{ [productId: string]: number }>({});

  const clearEditingStock = (productId: string) => {
    setEditingStock(prev => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });
  };

  const clearEditingReorderLevel = (productId: string) => {
    setEditingReorderLevel(prev => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });
  };

  const getStockIcon = (currentStock: number, reorderLevel: number) => {
    if (currentStock === 0) return <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />;
    if (currentStock <= reorderLevel) return <TrendingDown className="w-3.5 h-3.5 text-amber-500" />;
    return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
  };

  if (inventory.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-900 text-lg font-medium">No inventory items found</p>
          <p className="text-gray-500 text-sm mt-1">Your product inventory will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Bulk Actions Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selectedItems.length === inventory.length && inventory.length > 0}
            onChange={(e) => e.target.checked ? onSelectAllItems() : onClearSelection()}
            className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 cursor-pointer"
          />
          <span className="text-sm text-gray-600 font-medium">
            {selectedItems.length > 0 ? `${selectedItems.length} selected` : 'Select all'}
          </span>
        </div>
        {selectedItems.length > 0 && (
          <button onClick={onClearSelection} className="text-sm text-gray-500 hover:text-gray-900 font-medium">
            Clear selection
          </button>
        )}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === inventory.length && inventory.length > 0}
                    onChange={(e) => e.target.checked ? onSelectAllItems() : onClearSelection()}
                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Available</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reorder Level</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.map((item) => {
                const productId = item.productId._id;
                const isSelected = selectedItems.includes(productId);
                return (
                  <tr key={item._id} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-gray-50' : ''}`}>
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleItemSelection(productId)}
                        className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 cursor-pointer"
                      />
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden mr-3 border border-gray-200">
                          {item.productId.mainImage?.url ? (
                            <img
                              src={item.productId.mainImage.url}
                              alt={item.productId.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                            {item.productId.name}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">ID: {productId.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-600 font-mono">{item.sku || '-'}</td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {getStockIcon(item.currentStock, item.reorderLevel)}
                        {editingStock[productId] !== undefined ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={editingStock[productId]}
                              onChange={(e) => setEditingStock(prev => ({ ...prev, [productId]: parseInt(e.target.value) || 0 }))}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-gray-900"
                              min="0"
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                onStockUpdate(productId, editingStock[productId], 'set');
                                clearEditingStock(productId);
                              }}
                              disabled={updateStock.isPending}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => clearEditingStock(productId)}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setEditingStock(prev => ({ ...prev, [productId]: item.currentStock }))}>
                            <span className="text-sm font-medium text-gray-900">{item.currentStock}</span>
                            <Edit2 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-600">{item.availableStock}</td>

                    <td className="px-4 py-4">
                      {editingReorderLevel[productId] !== undefined ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={editingReorderLevel[productId]}
                            onChange={(e) => setEditingReorderLevel(prev => ({ ...prev, [productId]: parseInt(e.target.value) || 0 }))}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:border-gray-900"
                            min="0"
                            autoFocus
                          />
                          <button
                            onClick={() => {
                              onReorderLevelUpdate(productId, editingReorderLevel[productId]);
                              clearEditingReorderLevel(productId);
                            }}
                            disabled={setReorderLevel.isPending}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => clearEditingReorderLevel(productId)}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setEditingReorderLevel(prev => ({ ...prev, [productId]: item.reorderLevel }))}>
                          <span className="text-sm text-gray-900">{item.reorderLevel}</span>
                          <Edit2 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ring-1 ring-inset capitalize whitespace-nowrap ${getStockBadge(item.status)}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onStockUpdate(productId, 1, 'add')}
                          disabled={updateStock.isPending}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded border border-transparent hover:border-emerald-100 transition-colors"
                          title="Add 1 Stock"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onStockUpdate(productId, 1, 'subtract')}
                          disabled={updateStock.isPending || item.currentStock === 0}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded border border-transparent hover:border-rose-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove 1 Stock"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}