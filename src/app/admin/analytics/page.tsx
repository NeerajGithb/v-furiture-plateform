'use client';

import { TrendingUp, Package, Users } from 'lucide-react';
import { useAdminAnalytics } from '@/hooks/admin/useAdminAnalytics';
import { LoaderGuard } from '@/components/ui/LoaderGuard';
import { EmptyStateGuard } from '@/components/ui/EmptyStateGuard';
import { EmptyState } from '@/components/ui/EmptyState';
import PageHeader from '@/components/PageHeader';
import StatsCards from './components/StatsCards';
import OrderStatusBreakdown from './components/OrderStatusBreakdown';
import TopProducts from './components/TopProducts';
import TopSellers from './components/TopSellers';
import UserMetrics from './components/UserMetrics';

export default function AdminAnalyticsPage() {
  const { data, isPending, error, refetch, isFetching } = useAdminAnalytics();

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Detailed insights and performance metrics"
        onRefresh={refetch}
        isRefreshing={isFetching}
      />

      <LoaderGuard isLoading={isPending} error={error} isEmpty={!data}>
        {() => {
          const sections = [
            {
              total: data!.overview.totalRevenue + data!.overview.totalOrders + data!.overview.totalProducts + data!.overview.totalUsers,
              title: 'Overview',
              icon: TrendingUp,
              node: <StatsCards overview={data!.overview} />
            },
            {
              total: data!.salesAnalytics.totalSales || 0,
              title: 'Sales',
              icon: Package,
              node: <OrderStatusBreakdown salesAnalytics={data!.salesAnalytics} />
            },
            {
              total: (data!.topPerformers.topProducts?.length || 0) + (data!.topPerformers.topSellers?.length || 0),
              title: 'Top Performers',
              icon: Package,
              node: (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <TopProducts topPerformers={data!.topPerformers} />
                  <TopSellers topPerformers={data!.topPerformers} />
                </div>
              )
            },
            {
              total: data!.userAnalytics.newUsers + data!.userAnalytics.activeUsers + data!.userAnalytics.returningUsers,
              title: 'User Activity',
              icon: Users,
              node: <UserMetrics userAnalytics={data!.userAnalytics} />
            }
          ];

          return (
            <>
              {sections.map((section) => (
                <EmptyStateGuard
                  key={section.title}
                  total={section.total}
                  empty={<EmptyState icon={section.icon} title={`No ${section.title.toLowerCase()}`} />}
                >
                  {section.node}
                </EmptyStateGuard>
              ))}
            </>
          );
        }}
      </LoaderGuard>
    </>
  );
}
