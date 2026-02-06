'use client';

import { useGlobalFilterStore } from '@/stores/globalFilterStore';
import { useSellerOrderUIStore } from '@/stores/seller/orderStore';
import {
  useSellerOrders,
  useSellerOrderStats,
  useUpdateOrderStatus,
  useBulkUpdateOrders,
  useExportOrders
} from '@/hooks/seller/useSellerOrders';
import { SellerOrderStatus } from '@/types/sellerOrder';
import OrdersSkeleton from '../components/skeletons/OrdersSkeleton';
import {
  OrdersHeader,
  OrdersStats,
  OrdersList,
  OrdersPagination
} from './components';
import PageHeader from '@/components/PageHeader';

export default function SellerOrdersPage() {
  // Use global filters
  const { orderStatus, search, page, setPage } = useGlobalFilterStore();

  // Orders store
  const {
    selectedOrders,
    toggleOrderSelection,
    selectAllOrders,
    clearSelection
  } = useSellerOrderUIStore();

  // React Query hooks - using global filters with pagination
  const { data: ordersData, isLoading } = useSellerOrders({
    status: orderStatus as SellerOrderStatus | undefined,
    search,
    page,
    limit: 20
  });

  // Get order stats
  const { data: orderStats } = useSellerOrderStats();

  const updateOrderStatus = useUpdateOrderStatus();
  const bulkUpdateOrders = useBulkUpdateOrders();
  const exportOrders = useExportOrders();

  const orders = ordersData?.orders || [];
  const pagination = ordersData?.pagination ? {
    ...ordersData.pagination,
    pages: ordersData.pagination.totalPages
  } : undefined;

  // Order update handlers
  const handleStatusChange = (orderId: string, newStatus: SellerOrderStatus, trackingNumber?: string) => {
    updateOrderStatus.mutate({
      orderId,
      data: { 
        status: newStatus, 
        trackingNumber,
        notes: `Status updated to ${newStatus}${trackingNumber ? ` with tracking: ${trackingNumber}` : ''}`
      }
    });
  };

  const handleBulkStatusUpdate = (status: SellerOrderStatus) => {
    if (selectedOrders.length === 0) return;
    
    bulkUpdateOrders.mutate({
      orderIds: selectedOrders,
      status: status,
      notes: `Bulk status update to ${status}`
    });
    clearSelection();
  };

  const handleExport = () => {
    exportOrders.mutate({
      status: orderStatus as any,
      format: 'xlsx'
    });
  };

  // Selection handlers
  const handleSelectAllOrders = () => {
    selectAllOrders(orders.map(order => order._id));
  };

  const handleClearSelection = () => {
    clearSelection();
  };

  return (
    <>
      {isLoading && <OrdersSkeleton />}
      {!isLoading && ordersData && (
        <div className="space-y-6">
          {/* Page Header with Export */}
          <PageHeader
            title="Orders"
            onExport={handleExport}
            isExporting={exportOrders.isPending}
            showExport={true}
          />

          {/* Order Stats */}
          <OrdersStats stats={orderStats} />

          {/* Orders Header with Bulk Actions */}
          <OrdersHeader
            selectedOrders={selectedOrders}
            onBulkStatusUpdate={handleBulkStatusUpdate}
            onExport={handleExport}
            onSelectAll={handleSelectAllOrders}
            onClearSelection={handleClearSelection}
            bulkUpdateOrders={bulkUpdateOrders}
            exportOrders={exportOrders}
          />

          {/* Orders List */}
          <OrdersList
            orders={orders}
            selectedOrders={selectedOrders}
            onToggleOrderSelection={toggleOrderSelection}
            onStatusChange={handleStatusChange}
            updateOrderStatus={updateOrderStatus}
          />

          {/* Pagination */}
          <OrdersPagination pagination={pagination} />
        </div>
      )}
    </>
  );
}
