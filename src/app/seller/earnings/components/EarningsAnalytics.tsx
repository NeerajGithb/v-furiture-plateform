'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Calendar,
  Package,
  IndianRupee,
  ShoppingCart,
  Users,
  Target
} from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { EarningsAnalyticsProps } from '@/types/sellerEarnings';

export default function EarningsAnalytics({ analytics, period, onPeriodChange }: EarningsAnalyticsProps) {
  const [activeChart, setActiveChart] = useState<'revenue' | 'orders' | 'categories'>('revenue');

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No analytics data available for this period</p>
      </div>
    );
  }

  const getTrendIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="w-4 h-4 text-emerald-600" />;
    if (growth < 0) return <TrendingDown className="w-4 h-4 text-rose-600" />;
    return <BarChart3 className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (growth: number) => {
    if (growth > 0) return 'text-emerald-600';
    if (growth < 0) return 'text-rose-600';
    return 'text-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h3>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select
            value={period}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="1year">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <IndianRupee className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">TOTAL REVENUE</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(analytics.monthlyTrends?.reduce((sum, month) => sum + month.revenue, 0) || 0)}
            </p>
            <div className="flex items-center gap-1">
              {getTrendIcon(analytics.monthlyTrends?.[analytics.monthlyTrends.length - 1]?.growth || 0)}
              <span className={`text-sm font-medium ${getTrendColor(analytics.monthlyTrends?.[analytics.monthlyTrends.length - 1]?.growth || 0)}`}>
                {analytics.monthlyTrends?.[analytics.monthlyTrends.length - 1]?.growth || 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">TOTAL ORDERS</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {analytics.monthlyTrends?.reduce((sum, month) => sum + month.orders, 0) || 0}
            </p>
            <p className="text-sm text-gray-500">
              Avg: {Math.round((analytics.monthlyTrends?.reduce((sum, month) => sum + month.orders, 0) || 0) / (analytics.monthlyTrends?.length || 1))} per month
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">AVG ORDER VALUE</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(
                (analytics.monthlyTrends?.reduce((sum, month) => sum + month.revenue, 0) || 0) /
                Math.max(analytics.monthlyTrends?.reduce((sum, month) => sum + month.orders, 0) || 1, 1)
              )}
            </p>
            <p className="text-sm text-gray-500">Per order</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Package className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">TOP PRODUCTS</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {analytics.topProducts?.length || 0}
            </p>
            <p className="text-sm text-gray-500">Best sellers</p>
          </div>
        </div>
      </div>

      {/* Chart Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'revenue', label: 'Revenue Trends', icon: TrendingUp },
              { id: 'orders', label: 'Order Volume', icon: ShoppingCart },
              { id: 'categories', label: 'Category Breakdown', icon: PieChart }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveChart(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeChart === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeChart === 'revenue' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Revenue Trends</h4>
              {analytics.monthlyTrends && analytics.monthlyTrends.length > 0 ? (
                <div className="space-y-4">
                  {analytics.monthlyTrends.map((month, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{month.month}</p>
                        <p className="text-sm text-gray-500">{month.orders} orders</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(month.revenue)}</p>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(month.growth)}
                          <span className={`text-sm font-medium ${getTrendColor(month.growth)}`}>
                            {month.growth > 0 ? '+' : ''}{month.growth}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No revenue data available</p>
              )}
            </div>
          )}

          {activeChart === 'orders' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Order Volume</h4>
              {analytics.monthlyTrends && analytics.monthlyTrends.length > 0 ? (
                <div className="space-y-4">
                  {analytics.monthlyTrends.map((month, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{month.month}</p>
                        <p className="text-sm text-gray-500">
                          Avg: {formatCurrency(month.revenue / Math.max(month.orders, 1))} per order
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{month.orders} orders</p>
                        <p className="text-sm text-gray-500">{formatCurrency(month.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No order data available</p>
              )}
            </div>
          )}

          {activeChart === 'categories' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Revenue by Category</h4>
              {analytics.revenueByCategory && analytics.revenueByCategory.length > 0 ? (
                <div className="space-y-4">
                  {analytics.revenueByCategory.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-blue-500 rounded" style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}></div>
                        <p className="font-medium text-gray-900">{category.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(category.revenue)}</p>
                        <p className="text-sm text-gray-500">{category.percentage}% of total</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No category data available</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      {analytics.topProducts && analytics.topProducts.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Products</h4>
          <div className="space-y-4">
            {analytics.topProducts.slice(0, 5).map((product, index) => (
              <div key={product.productId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.productName}</p>
                    <p className="text-sm text-gray-500">{product.orders} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(product.revenue)}</p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(product.revenue / Math.max(product.orders, 1))} avg
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}