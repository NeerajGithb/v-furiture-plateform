'use client';

import { useAdminDashboard } from '@/hooks/admin/useAdminDashboard';
import { useDashboardUIStore } from '@/stores/admin/dashboardStore';
import { LoaderGuard } from '@/components/ui/LoaderGuard';
import MainStatsCards from './components/MainStatsCards';
import SecondaryStats from './components/SecondaryStats';
import TopProducts from './components/TopProducts';
import SearchAndPayment from './components/SearchAndPayment';
import InventoryAndEngagement from './components/InventoryAndEngagement';
import RecentActivity from './components/RecentActivity';
import OrderStatusBreakdown from './components/OrderStatusBreakdown';

export default function AdminDashboardPage() {
  const selectedTab = useDashboardUIStore(s => s.selectedTab);
  
  const { data, isLoading, error } = useAdminDashboard({
    period: selectedTab === 'overview' ? '30d' : selectedTab
  });

  return (
    <LoaderGuard isLoading={isLoading} error={error}>
      {data && (
        <>
          <MainStatsCards
            revenue={data.revenue}
            orders={data.orders}
            users={data.users}
            products={data.products}
            growth={data.growth}
          />

          <SecondaryStats
            users={data.users}
            engagement={data.engagement}
            search={data.search}
            reviews={data.reviews}
          />

          <TopProducts
            mostViewed={data.topProducts.mostViewed}
            bestSellers={data.topProducts.bestSellers}
            mostWishlisted={data.topProducts.mostWishlisted}
          />

          <SearchAndPayment
            search={data.search}
            paymentMethods={data.paymentMethods}
          />

          <InventoryAndEngagement
            products={data.products}
            users={data.users}
            engagement={data.engagement}
          />

          <RecentActivity
            users={data.recentActivity.users}
            sellers={data.recentActivity.sellers}
            orders={data.recentActivity.orders}
          />

          <OrderStatusBreakdown 
            orders={data.orders} 
          />
        </>
      )}
    </LoaderGuard>
  );
}