'use client';

import { useSellerOrderUIStore } from '@/stores/seller/orderStore';
import {
  useSellerOrders,
  useSellerOrderStats,
  useUpdateOrderStatus,
  useBulkUpdateOrders
} from '@/hooks/seller/useSellerOrders';
import { SellerOrderStatus } from '@/types/seller/orders';
import { LoaderGuard } from '@/components/ui/LoaderGuard';
import PageHeader from '@/components/PageHeader';
import {
  OrdersStats,
  OrdersList,
  OrdersPagination,
  BulkActionsHeader
} from './components';

export default function SellerOrdersPage() {
  const currentPage = useSellerOrderUIStore(s => s.currentPage);
  const setCurrentPage = useSellerOrderUIStore(s => s.setCurrentPage);
  const selectedOrders = useSellerOrderUIStore(s => s.selectedOrders);
  const toggleOrderSelection = useSellerOrderUIStore(s => s.toggleOrderSelection);
  const selectAllOrders = useSellerOrderUIStore(s => s.selectAllOrders);
  const clearSelection = useSellerOrderUIStore(s => s.clearSelection);

  const { data: ordersData, isPending, error, refetch, isFetching } = useSellerOrders();
  const { data: orderStats } = useSellerOrderStats();

  const updateOrderStatus = useUpdateOrderStatus();
  const bulkUpdateOrders = useBulkUpdateOrders();

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

  const handleSelectAllOrders = () => {
    if (ordersData?.orders) {
      selectAllOrders(ordersData.orders.map(order => order.id));
    }
  };

  const selectedOrdersData = ordersData?.orders.filter(o => selectedOrders.includes(o.id)) || [];

  return (
    <>
      <PageHeader
        title="Orders"
        description="Manage and track your customer orders"
        onRefresh={refetch}
        isRefreshing={isFetching}
      />

      <LoaderGuard 
        isLoading={isPending} 
        error={error}
        isEmpty={!ordersData || ordersData.orders.length === 0}
        emptyMessage="No orders found"
      >
        {() => (
          <div className="space-y-6">
            <OrdersStats stats={orderStats} />

            <BulkActionsHeader
              selectedOrders={selectedOrdersData}
              onBulkStatusUpdate={handleBulkStatusUpdate}
              onSelectAll={handleSelectAllOrders}
              onClearSelection={clearSelection}
              isUpdating={bulkUpdateOrders.isPending}
            />

            <OrdersList
              orders={ordersData!.orders}
              selectedOrders={selectedOrders}
              onToggleOrderSelection={toggleOrderSelection}
              onStatusChange={handleStatusChange}
              updateOrderStatus={updateOrderStatus}
            />

            <OrdersPagination 
              pagination={ordersData!.pagination ? {
                ...ordersData!.pagination,
                pages: ordersData!.pagination.totalPages
              } : undefined}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </LoaderGuard>
    </>
  );
}
