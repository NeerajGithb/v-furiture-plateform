import {
  Tag, DollarSign, Percent, Edit2, Trash2,
  ToggleLeft, ToggleRight, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { AdminCoupon } from '@/types/coupon';
import { formatCurrency } from '@/utils/currency';

interface CouponsTableProps {
  coupons: AdminCoupon[];
  selectedCoupons: string[];
  onToggleSelection: (couponId: string) => void;
  onSelectAll: (couponIds: string[]) => void;
  onEditCoupon: (coupon: AdminCoupon) => void;
  onDeleteCoupon: (couponId: string) => void;
  onToggleStatus: (couponId: string, active: boolean) => void;
}

export default function CouponsTable({
  coupons,
  selectedCoupons,
  onToggleSelection,
  onSelectAll,
  onEditCoupon,
  onDeleteCoupon,
  onToggleStatus
}: CouponsTableProps) {
  const getStatusBadge = (coupon: AdminCoupon) => {
    if (!coupon.active) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-600/20">
          <XCircle className="w-3 h-3" />
          Inactive
        </span>
      );
    }
    if (new Date(coupon.expiry) < new Date()) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20">
          <Clock className="w-3 h-3" />
          Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
        <CheckCircle className="w-3 h-3" />
        Active
      </span>
    );
  };

  const getTypeBadge = (type: 'flat' | 'percent', value: number) => {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${type === 'flat'
          ? 'bg-blue-50 text-blue-700 border-blue-200'
          : 'bg-purple-50 text-purple-700 border-purple-200'
        }`}>
        {type === 'flat' ? <DollarSign className="w-3 h-3" /> : <Percent className="w-3 h-3" />}
        {type === 'flat' ? formatCurrency(value) : `${value}%`}
      </span>
    );
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return limit > 0 ? ((used / limit) * 100).toFixed(1) : '0';
  };

  const allSelected = coupons.length > 0 && selectedCoupons.length === coupons.length;
  const someSelected = selectedCoupons.length > 0 && selectedCoupons.length < coupons.length;

  if (coupons.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-12 text-center">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-900 font-medium">No coupons found</p>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={() => onSelectAll(allSelected ? [] : coupons.map(c => c._id))}
                  className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Code</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Usage</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Expiry</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {coupons.map((coupon) => (
              <tr key={coupon._id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedCoupons.includes(coupon._id)}
                    onChange={() => onToggleSelection(coupon._id)}
                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-mono font-medium text-gray-900">{coupon.code}</span>
                    {coupon.description && (
                      <span className="text-xs text-gray-500 truncate max-w-[200px]">{coupon.description}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {getTypeBadge(coupon.type, coupon.value)}
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(coupon)}
                </td>
                <td className="px-4 py-3">
                  <div className="w-32">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{coupon.usedCount}/{coupon.usageLimit}</span>
                      <span>{getUsagePercentage(coupon.usedCount, coupon.usageLimit)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${coupon.usedCount >= coupon.usageLimit
                            ? 'bg-red-500'
                            : coupon.usedCount > coupon.usageLimit * 0.8
                              ? 'bg-amber-500'
                              : 'bg-green-500'
                          }`}
                        style={{
                          width: `${Math.min(100, (coupon.usedCount / coupon.usageLimit) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(coupon.expiry).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onToggleStatus(coupon._id, !coupon.active)}
                      className={`p-1.5 rounded transition-colors ${coupon.active
                          ? 'text-gray-500 hover:text-amber-600 hover:bg-amber-50'
                          : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                        }`}
                      title={coupon.active ? 'Deactivate' : 'Activate'}
                    >
                      {coupon.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => onEditCoupon(coupon)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteCoupon(coupon._id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}