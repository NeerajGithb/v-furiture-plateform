'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  ShoppingCart,
  IndianRupee,
  Clock,
  Truck,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  AlertTriangle,
  X,
  ArrowRight
} from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { useSellerDashboard } from '@/hooks/seller/useSellerDashboard';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton';

export default function SellerDashboardPage() {
  const [showPendingBanner, setShowPendingBanner] = useState(true);
  const { data: stats, isLoading } = useSellerDashboard();
  const { seller } = useAuthGuard();

  const getGrowthColor = (value: number) => {
    if (value > 0) return 'text-emerald-700 bg-emerald-50';
    if (value < 0) return 'text-rose-700 bg-rose-50';
    return 'text-gray-600 bg-gray-100';
  };

  const primaryStats = [
    {
      label: 'Total Revenue',
      value: formatCurrency(stats?.revenue?.total || 0),
      subValue: formatCurrency(stats?.revenue?.completed || 0),
      subLabel: 'Completed',
      icon: IndianRupee,
      growth: stats?.revenue?.growth || 0
    },
    {
      label: 'Total Orders',
      value: stats?.orders?.total || 0,
      subValue: stats?.orders?.delivered || 0,
      subLabel: 'Delivered',
      icon: ShoppingCart,
      growth: 0
    },
    {
      label: 'Products',
      value: stats?.products?.total || 0,
      subValue: stats?.products?.published || 0,
      subLabel: 'Published',
      icon: Package,
      growth: 0
    },
    {
      label: 'Fulfillment Rate',
      value: `${((stats?.orders?.delivered || 0) / Math.max(stats?.orders?.total || 1, 1) * 100).toFixed(1)}%`,
      subValue: stats?.products?.published || 0,
      subLabel: 'Active',
      icon: BarChart3,
      growth: 0
    }
  ];

  const orderStatusStats = [
    { label: 'Pending', value: stats?.orders?.pending || 0, color: 'text-amber-700 bg-amber-50', icon: Clock },
    { label: 'Processing', value: stats?.orders?.processing || 0, color: 'text-blue-700 bg-blue-50', icon: Package },
    { label: 'Shipped', value: stats?.orders?.shipped || 0, color: 'text-purple-700 bg-purple-50', icon: Truck },
    { label: 'Delivered', value: stats?.orders?.delivered || 0, color: 'text-emerald-700 bg-emerald-50', icon: CheckCircle }
  ];

  return (
    <>
      {isLoading && <DashboardSkeleton />}
      {!isLoading && stats && (
        <div className="space-y-6 max-w-[1600px] mx-auto">
          {/* Pending Approval Banner */}
          {seller?.status === 'pending' && showPendingBanner && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border border-amber-200 rounded-md p-4"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-amber-900">Account Pending Approval</h3>
                  <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                    Your seller account is currently under review. Most features are available, but full visibility will be granted upon approval.
                  </p>
                </div>
                <button
                  onClick={() => setShowPendingBanner(false)}
                  className="text-amber-700 hover:text-amber-900 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">Overview of your store performance</p>
            </div>
          </div>

          {/* Primary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {primaryStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">{stat.label}</h3>
                  <stat.icon className="w-4 h-4 text-gray-400" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                    {stat.growth !== 0 && (
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getGrowthColor(stat.growth)}`}>
                        {stat.growth > 0 ? '+' : ''}{stat.growth.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="font-medium text-gray-900">{stat.subValue}</span> {stat.subLabel}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Status */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">
                  Order Status
                </h3>
                <div className="space-y-4">
                  {orderStatusStats.map((status) => (
                    <div key={status.label} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-md ${status.color.split(' ')[1]}`}>
                          <status.icon className={`w-4 h-4 ${status.color.split(' ')[0]}`} />
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{status.label}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {status.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-gray-500">Avg. Order Value</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency((stats?.revenue?.total || 0) / Math.max(stats?.orders?.total || 1, 1))}
                    </span>
                  </div>
                  <button onClick={() => window.location.href = '/seller/orders'} className="w-full mt-2 text-sm text-center text-gray-600 hover:text-gray-900 font-medium py-2 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                    View All Orders
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="/seller/products/add"
                    className="flex flex-col items-center justify-center p-3 text-center border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-all group"
                  >
                    <Package className="w-5 h-5 text-gray-400 group-hover:text-gray-900 mb-2 transition-colors" />
                    <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">Add Product</span>
                  </a>
                  <a
                    href="/seller/orders"
                    className="flex flex-col items-center justify-center p-3 text-center border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-all group"
                  >
                    <ShoppingCart className="w-5 h-5 text-gray-400 group-hover:text-gray-900 mb-2 transition-colors" />
                    <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">Orders</span>
                  </a>
                  <a
                    href="/seller/earnings"
                    className="flex flex-col items-center justify-center p-3 text-center border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-all group"
                  >
                    <BarChart3 className="w-5 h-5 text-gray-400 group-hover:text-gray-900 mb-2 transition-colors" />
                    <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">Earnings</span>
                  </a>
                  <a
                    href="/seller/reviews"
                    className="flex flex-col items-center justify-center p-3 text-center border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-all group"
                  >
                    <Users className="w-5 h-5 text-gray-400 group-hover:text-gray-900 mb-2 transition-colors" />
                    <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">Reviews</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Recent Orders
                  </h3>
                </div>

                <div className="flex-1 overflow-auto">
                  {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {stats.recentOrders.slice(0, 8).map((order) => (
                        <div
                          key={order.id}
                          className="group flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-500 font-medium text-xs">
                              #{order.orderNumber.slice(-3)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{order.orderNumber}</p>
                              <p className="text-xs text-gray-500">{order.customerName}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                      <div className="p-4 border-t border-gray-100">
                        <a href="/seller/orders" className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
                          View All Recent Activity <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                      <ShoppingCart className="w-10 h-10 text-gray-300 mb-3" />
                      <p className="text-sm">No recent orders found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
