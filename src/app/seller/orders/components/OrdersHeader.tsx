'use client';

import { Download, MoreHorizontal } from 'lucide-react';
import { SellerOrderStatus, OrdersHeaderProps } from '@/types/sellerOrder';

export default function OrdersHeader({
  selectedOrders,
  onBulkStatusUpdate,
  onExport,
  onSelectAll,
  onClearSelection,
  bulkUpdateOrders,
  exportOrders
}: OrdersHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and track your customer orders</p>
      </div>

      <div className="flex items-center gap-3">
        {selectedOrders.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1.5 rounded-md">
              {selectedOrders.length} selected
            </span>
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                <MoreHorizontal className="w-4 h-4" />
                Bulk Actions
              </button>
              <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <div className="py-1">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Update Status
                  </div>
                  <button
                    onClick={() => onBulkStatusUpdate('confirmed' as SellerOrderStatus)}
                    disabled={bulkUpdateOrders.isPending}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Mark as Confirmed
                  </button>
                  <button
                    onClick={() => onBulkStatusUpdate('processing' as SellerOrderStatus)}
                    disabled={bulkUpdateOrders.isPending}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Mark as Processing
                  </button>
                  <button
                    onClick={() => onBulkStatusUpdate('shipped' as SellerOrderStatus)}
                    disabled={bulkUpdateOrders.isPending}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Mark as Shipped
                  </button>
                  <button
                    onClick={() => onBulkStatusUpdate('delivered' as SellerOrderStatus)}
                    disabled={bulkUpdateOrders.isPending}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Mark as Delivered
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button
                    onClick={onSelectAll}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Select All
                  </button>
                  <button
                    onClick={onClearSelection}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={onExport}
          disabled={exportOrders.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          {exportOrders.isPending ? 'Exporting...' : 'Export'}
        </button>
      </div>
    </div>
  );
}