import { 
  Bell, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Package,
  CreditCard,
  Users,
  Settings
} from 'lucide-react';
import { NotificationStats } from '@/types/seller/notifications';

interface NotificationsStatsProps {
  stats?: NotificationStats;
}

export function NotificationsStats({ stats }: NotificationsStatsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const typeIcons = {
    order: Package,
    account: Users,
    product: Package,
    payment: CreditCard,
    inventory: Package,
    performance: TrendingUp,
    customer: Users,
    system: Settings
  };

  const priorityColors = {
    critical: 'text-red-600 bg-red-50 border-red-200',
    high: 'text-orange-600 bg-orange-50 border-orange-200',
    medium: 'text-blue-600 bg-blue-50 border-blue-200',
    low: 'text-gray-600 bg-gray-50 border-gray-200'
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-rose-600">{stats.unread}</p>
            </div>
            <div className="p-2 bg-rose-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-rose-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Read</p>
              <p className="text-2xl font-bold text-green-600">{stats.total - stats.unread}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today</p>
              <p className="text-2xl font-bold text-blue-600">{stats.recentActivity.today}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Type */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">By Type</h3>
          <div className="space-y-3">
            {Object.entries(stats.byType).map(([type, count]) => {
              const IconComponent = typeIcons[type as keyof typeof typeIcons] || Bell;
              return (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gray-50 rounded">
                      <IconComponent className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {type}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Priority */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">By Priority</h3>
          <div className="space-y-3">
            {Object.entries(stats.byPriority).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium border ${
                    priorityColors[priority as keyof typeof priorityColors]
                  }`}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.recentActivity.today}</p>
            <p className="text-sm text-gray-600">Today</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.recentActivity.thisWeek}</p>
            <p className="text-sm text-gray-600">This Week</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.recentActivity.thisMonth}</p>
            <p className="text-sm text-gray-600">This Month</p>
          </div>
        </div>
      </div>
    </div>
  );
}