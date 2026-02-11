import { Tag, TrendingUp, Users, Clock } from 'lucide-react';
import { CouponStats } from '@/types/admin/coupons';

interface CouponsOverviewProps {
  stats?: CouponStats;
  isLoading?: boolean;
}

export default function CouponsOverview({ stats, isLoading }: CouponsOverviewProps) {
  if (isLoading || !stats) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <div className="bg-amber-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">Expired Coupons</p>
              <p className="text-2xl font-bold text-amber-900">{stats.expired}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
        </div>
      </div>

      {stats.mostUsed && stats.mostUsed.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Most Used Coupons</h3>
          <div className="space-y-2">
            {stats.mostUsed.map((coupon) => (
              <div key={coupon.id} className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{coupon.code}</span>
                <span className="text-gray-500">{coupon.usedCount} uses</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
