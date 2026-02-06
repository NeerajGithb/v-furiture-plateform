'use client';

import { Package, AlertTriangle, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { InventoryStatsProps } from '@/types/sellerInventory';

export default function InventoryStats({ stats }: InventoryStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Package className="w-4 h-4 text-gray-600" />
          </div>
          <span className="text-xs font-medium text-gray-500">Total Items</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-xs font-medium text-gray-500">In Stock</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats?.inStock || 0}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-amber-50 rounded-lg">
            <TrendingDown className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-xs font-medium text-gray-500">Low Stock</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats?.lowStock || 0}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-rose-50 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-xs font-medium text-gray-500">Out of Stock</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats?.outOfStock || 0}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <BarChart3 className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-xs font-medium text-gray-500">Total Value</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.totalValue || 0)}</p>
      </div>
    </div>
  );
}