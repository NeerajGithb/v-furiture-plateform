'use client';

import { TrendingUp, TrendingDown, DollarSign, CreditCard, Clock, Package, Percent, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { EarningsSummaryProps } from '@/types/sellerEarnings';

export default function EarningsSummary({ summary }: EarningsSummaryProps) {
  const metrics = [
    {
      title: 'Total Revenue',
      value: formatCurrency(summary?.totalRevenue || 0),
      icon: DollarSign,
      iconBg: 'bg-gray-50',
      iconColor: 'text-gray-900',
      growth: summary?.growth,
      description: 'All-time earnings'
    },
    {
      title: 'Available Balance',
      value: formatCurrency(summary?.completedRevenue || 0),
      icon: CreditCard,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      description: 'Ready for payout'
    },
    {
      title: 'Pending Revenue',
      value: formatCurrency(summary?.pendingRevenue || 0),
      icon: Clock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      description: 'Processing orders'
    },
    {
      title: 'Platform Fees',
      value: formatCurrency(summary?.platformFees || 0),
      icon: Percent,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      description: 'Commission deducted'
    }
  ];

  // Additional metrics if available
  const additionalMetrics = [];
  
  if (summary?.netEarnings !== undefined) {
    additionalMetrics.push({
      title: 'Net Earnings',
      value: formatCurrency(summary.netEarnings),
      icon: Package,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      description: 'After platform fees'
    });
  }

  if (summary?.totalOrders !== undefined) {
    additionalMetrics.push({
      title: 'Total Orders',
      value: summary.totalOrders.toLocaleString(),
      icon: ShoppingBag,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      description: 'Orders completed'
    });
  }

  if (summary?.averageOrderValue !== undefined) {
    additionalMetrics.push({
      title: 'Avg Order Value',
      value: formatCurrency(summary.averageOrderValue),
      icon: TrendingUp,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
      description: 'Per order average'
    });
  }

  const allMetrics = [...metrics, ...additionalMetrics];

  return (
    <div className="space-y-6">
      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${metric.iconBg} rounded-lg`}>
                <metric.icon className={`w-5 h-5 ${metric.iconColor}`} />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {metric.value}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{metric.description}</p>
              {metric.growth !== undefined && (
                <div className="flex items-center gap-1.5 text-sm">
                  {metric.growth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-rose-500" />
                  )}
                  <span className={`font-medium ${metric.growth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {metric.growth >= 0 ? '+' : ''}{metric.growth.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Metrics if available */}
      {additionalMetrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {additionalMetrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 ${metric.iconBg} rounded-lg`}>
                  <metric.icon className={`w-4 h-4 ${metric.iconColor}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                  <p className="text-lg font-semibold text-gray-900">{metric.value}</p>
                  <p className="text-xs text-gray-400">{metric.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Revenue Breakdown */}
      {summary && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
          <div className="space-y-4">
            {/* Progress bars for revenue breakdown */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Available Balance</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(summary.completedRevenue || 0)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${summary.totalRevenue > 0 ? (summary.completedRevenue / summary.totalRevenue) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Pending Revenue</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(summary.pendingRevenue || 0)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${summary.totalRevenue > 0 ? (summary.pendingRevenue / summary.totalRevenue) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Platform Fees</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(summary.platformFees || 0)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${summary.totalRevenue > 0 ? (summary.platformFees / summary.totalRevenue) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
          </div>

          {/* Summary totals */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-gray-900">Total Revenue</span>
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(summary.totalRevenue || 0)}
              </span>
            </div>
            {summary.growth !== undefined && (
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">Growth vs last period</span>
                <div className="flex items-center gap-1.5">
                  {summary.growth >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-rose-500" />
                  )}
                  <span className={`text-sm font-medium ${summary.growth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {summary.growth >= 0 ? '+' : ''}{summary.growth.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}