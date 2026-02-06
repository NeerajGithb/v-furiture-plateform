'use client';

import { BarChart3, RefreshCw } from 'lucide-react';
import { useAdminAnalytics } from '@/hooks/admin/useAdminAnalytics';
import StatsCards from './components/StatsCards';
import OrderStatusBreakdown from './components/OrderStatusBreakdown';
import ProductAnalytics from './components/ProductAnalytics';
import SearchAnalytics from './components/SearchAnalytics';
import EngagementMetrics from './components/EngagementMetrics';
import AnalyticsSkeleton from './components/AnalyticsSkeleton';

export default function AdminAnalyticsPage() {
  const { data: stats, isLoading, refetch } = useAdminAnalytics();

  return (
    <>
      {isLoading && <AnalyticsSkeleton />}
      {!isLoading && stats && (
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="text-sm text-gray-500">Detailed insights and performance metrics</p>
              </div>
            </div>
            
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <StatsCards 
            revenue={stats.revenue} 
            orders={stats.orders} 
            products={stats.products} 
            users={stats.users} 
            growth={stats.growth}
            selectedMetric="revenue"
            onMetricSelect={() => {}}
          />

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ProductAnalytics products={stats.products} reviews={stats.reviews} />
            <SearchAnalytics search={stats.search} />
          </div>

          {/* Order Status Breakdown */}
          <OrderStatusBreakdown orders={stats.orders} />

          {/* Engagement Metrics */}
          <EngagementMetrics engagement={stats.engagement} />
        </div>
      )}
    </>
  );
}
