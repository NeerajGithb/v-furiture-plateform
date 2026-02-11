'use client';

import {
  useAdminOrders,
  useAdminOrderStats,
} from '../../../hooks/admin/useAdminOrders';
import { useOrderUIStore } from '@/stores/admin/orderStore';
import { LoaderGuard } from '@/components/ui/LoaderGuard';
import { Pagination } from '@/components/ui/Pagination';
import PageHeader from '@/components/PageHeader';
import OrdersStats from './components/OrdersStats';
import OrdersTable from './components/OrdersTable';

export default function AdminOrdersPage() {
  const expandedOrder = useOrderUIStore(s => s.expandedOrder);
  const setExpandedOrder = useOrderUIStore(s => s.setExpandedOrder);
  const currentPage = useOrderUIStore(s => s.currentPage);
  const setCurrentPage = useOrderUIStore(s => s.setCurrentPage);

  const { data: ordersData, isPending, error, refetch, isFetching } = useAdminOrders();
  const { data: stats, isPending: statsPending } = useAdminOrderStats();

  const handleToggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <>
      <PageHeader
        title="Orders"
        description="Monitor and manage all marketplace orders"
        onRefresh={refetch}
        isRefreshing={isFetching}
      />

      <LoaderGuard 
        isLoading={isPending} 
        error={error} 
        isEmpty={!ordersData || (ordersData.pagination?.total || 0) === 0}
        emptyMessage="No orders"
      >
        {() => (
          <>
            <OrdersStats stats={stats} isLoading={statsPending} />

            <OrdersTable
              orders={ordersData!.data}
              expandedOrder={expandedOrder}
              onToggleExpand={handleToggleExpand}
            />

            <Pagination 
              pagination={ordersData!.pagination}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </LoaderGuard>
    </>
  );
}
