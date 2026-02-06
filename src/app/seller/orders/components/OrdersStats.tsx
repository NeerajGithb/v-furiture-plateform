'use client';

import { ShoppingCart, Clock, Package, Truck, CheckCircle } from 'lucide-react';
import { OrdersStatsProps } from '@/types/sellerOrder';

export default function OrdersStats({ stats }: OrdersStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <ShoppingCart className="w-4 h-4 text-gray-600" />
          </div>
          <span className="text-xs font-medium text-gray-500">Total</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-xs font-medium text-gray-500">Pending</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats?.pending || 0}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-xs font-medium text-gray-500">Processing</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats?.processing || 0}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Truck className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-xs font-medium text-gray-500">Shipped</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats?.shipped || 0}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-xs font-medium text-gray-500">Delivered</span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{stats?.delivered || 0}</p>
      </div>
    </div>
  );
}