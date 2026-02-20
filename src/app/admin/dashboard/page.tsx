'use client';

import { TrendingUp, Users, Box, Store, Package, CreditCard, Star } from 'lucide-react';
import { useAdminDashboard } from '@/hooks/admin/useAdminDashboard';
import { LoaderGuard } from '@/components/ui/LoaderGuard';
import { EmptyStateGuard } from '@/components/ui/EmptyStateGuard';
import { EmptyState } from '@/components/ui/EmptyState';
import PageHeader from '@/components/PageHeader';
import { formatCurrency } from '@/utils/currency';
import OverviewStats from './components/OverviewStats';
import SalesMetricsCard from './components/SalesMetricsCard';
import UserMetricsCard from './components/UserMetricsCard';
import ProductMetricsCard from './components/ProductMetricsCard';
import SellerMetricsCard from './components/SellerMetricsCard';
import OrderMetricsCard from './components/OrderMetricsCard';
import PaymentMetricsCard from './components/PaymentMetricsCard';
import ReviewMetricsCard from './components/ReviewMetricsCard';
import MetricItem from './components/MetricItem';

export default function AdminDashboardPage() {
  const { data, isPending, error, refetch, isFetching } = useAdminDashboard();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your platform metrics"
        onRefresh={refetch}
        isRefreshing={isFetching}
      />
      
      <LoaderGuard isLoading={isPending} error={error} isEmpty={!data}>
        {() => {
          const metrics = [
            {
              total: data!.sales.todayRevenue + data!.sales.weekRevenue + data!.sales.monthRevenue + data!.sales.yearRevenue,
              title: 'Sales',
              icon: TrendingUp,
              node: <SalesMetricsCard sales={data!.sales} />
            },
            {
              total: data!.users.totalUsers,
              title: 'Users',
              icon: Users,
              node: <UserMetricsCard users={data!.users} />
            },
            {
              total: data!.products.totalProducts,
              title: 'Products',
              icon: Box,
              node: <ProductMetricsCard products={data!.products} />
            },
            {
              total: data!.sellers.totalSellers,
              title: 'Sellers',
              icon: Store,
              node: <SellerMetricsCard sellers={data!.sellers} />
            },
            {
              total: data!.orders.totalOrders,
              title: 'Orders',
              icon: Package,
              node: <OrderMetricsCard orders={data!.orders} />
            },
            {
              total: data!.payments.totalPayments,
              title: 'Payments',
              icon: CreditCard,
              node: <PaymentMetricsCard payments={data!.payments} />
            },
            {
              total: data!.reviews.totalReviews,
              title: 'Reviews',
              icon: Star,
              node: <ReviewMetricsCard reviews={data!.reviews} />
            }
          ];

          return (
            <>
              <EmptyStateGuard
                total={(data!.overview.totalRevenue || 0) + (data!.overview.totalOrders || 0) + (data!.overview.totalUsers || 0)}
                empty={<EmptyState icon={TrendingUp} title="No overview data" />}
              >
                <OverviewStats overview={data!.overview} />
              </EmptyStateGuard>
              
              {metrics.map((metric) => (
                <EmptyStateGuard
                  key={metric.title}
                  total={metric.total}
                  empty={<EmptyState icon={metric.icon} title={`No ${metric.title.toLowerCase()}`} />}
                >
                  {metric.node}
                </EmptyStateGuard>
              ))}

              {data!.realTime && (
                <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
                  <h2 className="text-[15px] font-semibold text-[#111111] mb-5 tracking-tight">Real-time Metrics</h2>
                  <div className="flex flex-wrap gap-6">
                    <MetricItem label="Active Users" value={data!.realTime.activeUsers.toLocaleString('en-IN')} />
                    <MetricItem label="Ongoing Orders" value={data!.realTime.ongoingOrders.toLocaleString('en-IN')} />
                    <MetricItem label="Today Revenue" value={formatCurrency(data!.realTime.todayRevenue)} />
                    <MetricItem 
                      label="System Health" 
                      value={data!.realTime.systemHealth}
                      className={
                        data!.realTime.systemHealth === 'healthy' ? 'text-[#059669]' :
                        data!.realTime.systemHealth === 'warning' ? 'text-[#D97706]' :
                        'text-[#DC2626]'
                      }
                    />
                  </div>
                </div>
              )}
            </>
          );
        }}
      </LoaderGuard>
    </>
  );
}