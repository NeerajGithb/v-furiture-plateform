'use client';

import { Package, AlertTriangle, Edit2, Plus, Minus, Check, X, TrendingDown, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { InventoryItem, StockUpdateType } from '@/types/seller/inventory';

interface InventoryTableProps {
  inventory: InventoryItem[];
  onStockUpdate: (productId: string, quantity: number, type?: StockUpdateType, reason?: string) => void;
  onReorderLevelUpdate: (productId: string, reorderLevel: number) => void;
  updateStock: any;
  setReorderLevel: any;
  getStockBadge: (status: string) => string;
}

const STOCK_BADGE: Record<string, string> = {
  in_stock: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  low_stock: 'bg-amber-50 border-amber-200 text-amber-700',
  out_of_stock: 'bg-rose-50 border-rose-200 text-rose-600',
};

export default function InventoryTable({
  inventory,
  onStockUpdate,
  onReorderLevelUpdate,
  updateStock,
  setReorderLevel,
}: InventoryTableProps) {
  const [editingStock, setEditingStock] = useState<{ [id: string]: number }>({});
  const [editingReorder, setEditingReorder] = useState<{ [id: string]: number }>({});

  const clearStock = (id: string) => setEditingStock(p => { const n = { ...p }; delete n[id]; return n; });
  const clearReorder = (id: string) => setEditingReorder(p => { const n = { ...p }; delete n[id]; return n; });

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F8F9FA] border-b border-[#E5E7EB]">
            <tr>
              {['Product', 'SKU', 'Current Stock', 'Available', 'Reorder Level', 'Status', ''].map(col => (
                <th
                  key={col}
                  className={`px-4 py-2.5 text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-widest ${col === '' ? 'text-right' : 'text-left'}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {inventory.map((item) => {
              const pid = item.productId.id;
              const isLow = item.currentStock > 0 && item.currentStock <= item.reorderLevel;
              const isOut = item.currentStock === 0;

              return (
                <tr key={item.id} className="hover:bg-[#FAFAFA] transition-colors duration-100">
                  {/* Product */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#F3F4F6] border border-[#E5E7EB] rounded-md flex-shrink-0 overflow-hidden">
                        {item.productId.mainImage?.url ? (
                          <img src={item.productId.mainImage.url} alt={item.productId.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-[#9CA3AF]" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-[#111111] truncate max-w-[180px]">{item.productId.name}</p>
                        <p className="text-[10px] text-[#9CA3AF] font-mono">#{pid.slice(-6).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="px-4 py-3 text-[12px] text-[#6B7280] font-mono">{item.sku || '—'}</td>

                  {/* Stock */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isOut ? <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> :
                        isLow ? <TrendingDown className="w-3.5 h-3.5 text-amber-400" /> :
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}

                      {editingStock[pid] !== undefined ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editingStock[pid]}
                            onChange={e => setEditingStock(p => ({ ...p, [pid]: parseInt(e.target.value) || 0 }))}
                            className="w-14 px-2 py-1 border border-[#E5E7EB] rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-[#111111]"
                            min="0"
                            autoFocus
                          />
                          <button
                            onClick={() => { onStockUpdate(pid, editingStock[pid], 'set'); clearStock(pid); }}
                            disabled={updateStock.isPending}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button onClick={() => clearStock(pid)} className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => setEditingStock(p => ({ ...p, [pid]: item.currentStock }))}
                          className="flex items-center gap-1.5 cursor-pointer group"
                        >
                          <span className="text-[13px] font-semibold text-[#111111] tabular-nums">{item.currentStock}</span>
                          <Edit2 className="w-3 h-3 text-[#9CA3AF] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Available */}
                  <td className="px-4 py-3 text-[13px] text-[#374151] tabular-nums">{item.availableStock}</td>

                  {/* Reorder Level */}
                  <td className="px-4 py-3">
                    {editingReorder[pid] !== undefined ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={editingReorder[pid]}
                          onChange={e => setEditingReorder(p => ({ ...p, [pid]: parseInt(e.target.value) || 0 }))}
                          className="w-14 px-2 py-1 border border-[#E5E7EB] rounded-md text-[12px] focus:outline-none focus:ring-2 focus:ring-[#111111]"
                          min="0"
                          autoFocus
                        />
                        <button
                          onClick={() => { onReorderLevelUpdate(pid, editingReorder[pid]); clearReorder(pid); }}
                          disabled={setReorderLevel.isPending}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button onClick={() => clearReorder(pid)} className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => setEditingReorder(p => ({ ...p, [pid]: item.reorderLevel }))}
                        className="flex items-center gap-1.5 cursor-pointer group"
                      >
                        <span className="text-[13px] text-[#374151] tabular-nums">{item.reorderLevel}</span>
                        <Edit2 className="w-3 h-3 text-[#9CA3AF] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-md border capitalize ${STOCK_BADGE[item.status] || 'bg-[#F8F9FA] border-[#E5E7EB] text-[#6B7280]'}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Quick adjust */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onStockUpdate(pid, 1, 'add')}
                        disabled={updateStock.isPending}
                        title="Add 1"
                        className="p-1.5 border border-[#E5E7EB] rounded-md text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 disabled:opacity-40 transition-all"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onStockUpdate(pid, 1, 'subtract')}
                        disabled={updateStock.isPending || item.currentStock === 0}
                        title="Remove 1"
                        className="p-1.5 border border-[#E5E7EB] rounded-md text-rose-500 hover:bg-rose-50 hover:border-rose-200 disabled:opacity-40 transition-all"
                      >
                        <Minus className="w-3 h-3" />
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
  );
}