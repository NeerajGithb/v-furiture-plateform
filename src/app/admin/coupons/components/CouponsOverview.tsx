import { Tag, TrendingUp, Users, Clock } from 'lucide-react';
import { CouponStats } from '@/types/coupon';
import { formatCurrency } from '@/utils/currency';

interface CouponsOverviewProps {
  stats: CouponStats;
  onTabChange: (tab: string) => void;
  activeTab: string;
}

export default function CouponsOverview({ stats, onTabChange, activeTab }: CouponsOverviewProps) {
  const tabs = [
    { id: 'all', label: 'All Coupons', count: stats.total },
    { id: 'active', label: 'Active', count: stats.active },
    { id: 'expired', label: 'Expired', count: stats.expired },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Coupons</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <Tag className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Coupons</p>
              <p className="text-2xl font-bold text-green-900">{stats.active}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Usage</p>
              <p className="text-2xl font-bold text-purple-900">{stats.totalUsages}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-amber-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">Total Savings</p>
              <p className="text-2xl font-bold text-amber-900">{formatCurrency(stats.totalSavings)}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-gray-100 text-gray-900'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}