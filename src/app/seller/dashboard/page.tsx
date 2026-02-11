'use client';

import { useSellerDashboard } from '@/hooks/seller/useSellerDashboard';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import PageHeader from '@/components/PageHeader';
import { LoaderGuard } from '@/components/ui/LoaderGuard';
import { PendingApprovalBanner } from './components/PendingApprovalBanner';
import { PrimaryStats } from './components/PrimaryStats';
import { OrderStatusCard } from './components/OrderStatusCard';
import { QuickActions } from './components/QuickActions';
import { RecentOrdersCard } from './components/RecentOrdersCard';

export default function SellerDashboardPage() {
  const { data, isPending, error, refetch, isFetching } = useSellerDashboard();
  const { seller } = useAuthGuard();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your store performance"
        onRefresh={refetch}
        isRefreshing={isFetching}
      />

      <LoaderGuard isLoading={isPending} error={error} isEmpty={!data}>
        {() => (
          <>
            <PendingApprovalBanner status={seller?.status} />
            
            <PrimaryStats data={data!} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <OrderStatusCard orders={data!.orders} revenue={data!.revenue} />
                <QuickActions />
              </div>

              <div className="lg:col-span-2">
                <RecentOrdersCard orders={data!.recentOrders} />
              </div>
            </div>
          </>
        )}
      </LoaderGuard>
    </>
  );
}
