'use client';

import { useState } from 'react';
import { Package, AlertTriangle, Edit2, Plus, Minus, Check, X, TrendingUp, TrendingDown } from 'lucide-react';
import { InventoryItem, StockUpdateType } from '@/types/seller/inventory';

interface InventoryTableProps {
  inventory: InventoryItem[];
  onStockUpdate: (productId: string, quantity: number, type?: StockUpdateType, reason?: string) => void;
  onReorderLevelUpdate: (productId: string, reorderLevel: number) => void;
  updateStock: any;
  setReorderLevel: any;
  getStockBadge: (status: string) => string;
}

export default function InventoryTable({
  inventory,
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

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
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
                const productId = item.productId.id;
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
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