import {
  Tag, DollarSign, Percent, Edit2, Trash2,
  ToggleLeft, ToggleRight, CheckCircle, XCircle, Clock
} from 'lucide-react';
import { AdminCoupon } from '@/types/admin/coupons';
import { useCouponUIStore } from '@/stores/admin/couponStore';
import { useConfirm } from '@/contexts/ConfirmContext';
import {
  useDeleteCoupon,
  useToggleCouponStatus,
  useBulkUpdateStatus,
  useBulkDeleteCoupons,
} from '@/hooks/admin/useAdminCoupons';
import { BulkActionsBar } from '@/components/ui/BulkActionsBar';

interface CouponsTableProps {
  coupons: AdminCoupon[];
}

export default function CouponsTable({ coupons }: CouponsTableProps) {
  const selectedCoupons = useCouponUIStore(s => s.selectedCoupons);
  const setSelectedCoupons = useCouponUIStore(s => s.setSelectedCoupons);
  const clearSelection = useCouponUIStore(s => s.clearSelection);
  const setEditingCoupon = useCouponUIStore(s => s.setEditingCoupon);
  const setShowEditModal = useCouponUIStore(s => s.setShowEditModal);

  const deleteCouponMutation = useDeleteCoupon();
  const toggleStatusMutation = useToggleCouponStatus();
  const bulkUpdateStatusMutation = useBulkUpdateStatus();
  const bulkDeleteMutation = useBulkDeleteCoupons();
  const { confirm } = useConfirm();

  const handleToggleSelection = (couponId: string) => {
    if (selectedCoupons.includes(couponId)) {
      setSelectedCoupons(selectedCoupons.filter(id => id !== couponId));
    } else {
      setSelectedCoupons([...selectedCoupons, couponId]);
    }
  };

  const handleSelectAll = (couponIds: string[]) => {
    if (selectedCoupons.length === couponIds.length) {
      clearSelection();
    } else {
      setSelectedCoupons(couponIds);
    }
  };

  const handleEditCoupon = (coupon: AdminCoupon) => {
    setEditingCoupon(coupon);
    setShowEditModal(true);
  };

  const handleDeleteCoupon = (couponId: string) => {
    const coupon = coupons.find((c: any) => c.id === couponId);
    confirm({
      title: 'Delete Coupon',
      message: `Are you sure you want to delete "${coupon?.code}"? This action cannot be undone.`,
      type: 'delete',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        deleteCouponMutation.mutate(couponId);
      }
    });
  };

  const handleToggleStatus = (couponId: string, active: boolean) => {
    toggleStatusMutation.mutate({ couponId, active });
  };

  const handleBulkActivate = () => {
    bulkUpdateStatusMutation.mutate(
      { couponIds: selectedCoupons, active: true },
      { onSuccess: () => clearSelection() }
    );
  };

  const handleBulkDeactivate = () => {
    bulkUpdateStatusMutation.mutate(
      { couponIds: selectedCoupons, active: false },
      { onSuccess: () => clearSelection() }
    );
  };

  const handleBulkDelete = () => {
    confirm({
      title: 'Delete Coupons',
      message: `Are you sure you want to delete ${selectedCoupons.length} coupons? This action cannot be undone.`,
      type: 'delete',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        bulkDeleteMutation.mutate(selectedCoupons, {
          onSuccess: () => clearSelection()
        });
      }
    });
  };
  const getStatusBadge = (coupon: AdminCoupon) => {
    if (!coupon.isActive) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-600/20">
          <XCircle className="w-3 h-3" />
          Inactive
        </span>
      );
    }
    if (new Date(coupon.expiryDate) < new Date()) {
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

  const getTypeBadge = (type: 'percentage' | 'fixed', value: number) => {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${type === 'fixed'
          ? 'bg-blue-50 text-blue-700 border-blue-200'
          : 'bg-purple-50 text-purple-700 border-purple-200'
        }`}>
        {type === 'fixed' ? <DollarSign className="w-3 h-3" /> : <Percent className="w-3 h-3" />}
        {type === 'fixed' ? `₹${value}` : `${value}%`}
      </span>
    );
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return limit > 0 ? ((used / limit) * 100).toFixed(1) : '0';
  };

  const allSelected = coupons.length > 0 && selectedCoupons.length === coupons.length;
  const someSelected = selectedCoupons.length > 0 && selectedCoupons.length < coupons.length;

  return (
    <>
      <BulkActionsBar
        selectedCount={selectedCoupons.length}
        actions={[
          {
            label: 'Activate',
            onClick: handleBulkActivate,
            disabled: bulkUpdateStatusMutation.isPending,
            variant: 'success',
          },
          {
            label: 'Deactivate',
            onClick: handleBulkDeactivate,
            disabled: bulkUpdateStatusMutation.isPending,
            variant: 'warning',
          },
          {
            label: 'Delete',
            onClick: handleBulkDelete,
            disabled: bulkDeleteMutation.isPending,
            variant: 'danger',
          },
        ]}
        onCancel={clearSelection}
      />

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
                  onChange={() => handleSelectAll(allSelected ? [] : coupons.map(c => c.id))}
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
              <tr key={coupon.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedCoupons.includes(coupon.id)}
                    onChange={() => handleToggleSelection(coupon.id)}
                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-mono font-medium text-gray-900">{coupon.code}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {getTypeBadge(coupon.type, coupon.discount)}
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(coupon)}
                </td>
                <td className="px-4 py-3">
                  <div className="w-32">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{coupon.usedCount}/{coupon.usageLimit || 'Unlimited'}</span>
                      {coupon.usageLimit && (
                        <span>{getUsagePercentage(coupon.usedCount, coupon.usageLimit)}%</span>
                      )}
                    </div>
                    {coupon.usageLimit && (
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
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(coupon.expiryDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleToggleStatus(coupon.id, !coupon.isActive)}
                      className={`p-1.5 rounded transition-colors ${coupon.isActive
                          ? 'text-gray-500 hover:text-amber-600 hover:bg-amber-50'
                          : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                        }`}
                      title={coupon.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {coupon.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleEditCoupon(coupon)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCoupon(coupon.id)}
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
    </>
  );
}