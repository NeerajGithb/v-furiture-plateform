'use client';

import React from 'react';
import {
  RefreshCw, Download
} from 'lucide-react';
import {
  useAdminOrders,
  useAdminOrderStats,
  useExportAdminOrders
} from '../../../hooks/admin/useAdminOrders';
import { useOrderUIStore } from '@/stores/admin/orderStore';
import { AdminOrder, PaymentStatus, OrderStats } from '@/types/order';
import OrdersOverview from './components/OrdersOverview';
import OrdersTable from './components/OrdersTable';
import OrdersSkeleton from './components/OrdersSkeleton';

export default function AdminOrdersPage() {
  // UI Store
  const {
    expandedOrder,
    activeTab,
    setExpandedOrder,
    setActiveTab
  } = useOrderUIStore();

  // React Query hooks - using existing hooks
  const { data: ordersData, isLoading, refetch } = useAdminOrders();
  const { data: stats, isLoading: statsLoading } = useAdminOrderStats();
  const { mutate: exportOrders, isPending: exportPending } = useExportAdminOrders();

  const allOrders = (ordersData as any)?.orders || [];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleToggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleExport = () => {
    exportOrders({});
  };

  return (
    <>
      {isLoading ? (
        <OrdersSkeleton />
      ) : ordersData ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
              <p className="text-sm text-gray-500 mt-1">Monitor and manage all marketplace orders</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium text-gray-700"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                disabled={exportPending}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium text-gray-700"
              >
                <Download className="w-4 h-4" />
                {exportPending ? 'Exporting...' : 'Export'}
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          {stats ? (
            <OrdersOverview
              stats={stats as OrderStats}
              onTabChange={handleTabChange}
              activeTab={activeTab}
            />
          ) : null}

          {/* Orders Table */}
          <OrdersTable
            orders={allOrders}
            expandedOrder={expandedOrder}
            onToggleExpand={handleToggleExpand}
          />
        </div>
      ) : null}
    </>
  );
}
