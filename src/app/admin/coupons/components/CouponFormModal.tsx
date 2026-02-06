import React, { useState, useEffect } from 'react';
import { X, Tag, DollarSign, Percent, Calendar, Users } from 'lucide-react';
import { AdminCoupon, CouponType } from '@/types/coupon';

interface CouponFormData {
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiry: string;
  usageLimit: number;
  perUserLimit: number;
  description?: string;
}

interface CouponFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CouponFormData) => void;
  editingCoupon?: AdminCoupon | null;
  isLoading?: boolean;
}

export default function CouponFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingCoupon,
  isLoading = false
}: CouponFormModalProps) {
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    type: 'flat',
    value: 0,
    minOrderAmount: 0,
    maxDiscount: undefined,
    expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: 1000,
    perUserLimit: 1,
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingCoupon) {
      setFormData({
        code: editingCoupon.code,
        type: editingCoupon.type,
        value: editingCoupon.value,
        minOrderAmount: editingCoupon.minOrderAmount,
        maxDiscount: editingCoupon.maxDiscount,
        expiry: new Date(editingCoupon.expiry).toISOString().split('T')[0],
        usageLimit: editingCoupon.usageLimit,
        perUserLimit: editingCoupon.perUserLimit,
        description: editingCoupon.description || '',
      });
    } else {
      setFormData({
        code: '',
        type: 'flat',
        value: 0,
        minOrderAmount: 0,
        maxDiscount: undefined,
        expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        usageLimit: 1000,
        perUserLimit: 1,
        description: '',
      });
    }
    setErrors({});
  }, [editingCoupon, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Coupon code is required';
    } else if (formData.code.length < 3) {
      newErrors.code = 'Coupon code must be at least 3 characters';
    }

    if (formData.value <= 0) {
      newErrors.value = 'Value must be greater than 0';
    }

    if (formData.type === 'percent' && formData.value > 100) {
      newErrors.value = 'Percentage cannot exceed 100%';
    }

    if (formData.minOrderAmount < 0) {
      newErrors.minOrderAmount = 'Minimum order amount cannot be negative';
    }

    if (formData.maxDiscount && formData.maxDiscount <= 0) {
      newErrors.maxDiscount = 'Maximum discount must be greater than 0';
    }

    if (new Date(formData.expiry) <= new Date()) {
      newErrors.expiry = 'Expiry date must be in the future';
    }

    if (formData.usageLimit <= 0) {
      newErrors.usageLimit = 'Usage limit must be greater than 0';
    }

    if (formData.perUserLimit <= 0) {
      newErrors.perUserLimit = 'Per user limit must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof CouponFormData, value: string | number | undefined) => {
    setFormData((prev: CouponFormData) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: Record<string, string>) => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Tag className="w-6 h-6" />
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.code ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., SAVE20"
                    disabled={!!editingCoupon}
                  />
                  {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value as CouponType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="flat">Fixed Amount (₹)</option>
                    <option value="percent">Percentage (%)</option>
                  </select>
                </div>
              </div>

              {/* Discount Value */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Value *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {formData.type === 'flat' ? (
                        <DollarSign className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Percent className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => handleChange('value', Number(e.target.value))}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.value ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder={formData.type === 'flat' ? '100' : '20'}
                      min="0"
                      max={formData.type === 'percent' ? 100 : undefined}
                    />
                  </div>
                  {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Order Amount
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={formData.minOrderAmount}
                      onChange={(e) => handleChange('minOrderAmount', Number(e.target.value))}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.minOrderAmount ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  {errors.minOrderAmount && <p className="text-red-500 text-xs mt-1">{errors.minOrderAmount}</p>}
                </div>
              </div>

              {/* Maximum Discount (for percentage coupons) */}
              {formData.type === 'percent' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Discount Amount (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={formData.maxDiscount || ''}
                      onChange={(e) => handleChange('maxDiscount', e.target.value ? Number(e.target.value) : undefined)}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.maxDiscount ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="No limit"
                      min="0"
                    />
                  </div>
                  {errors.maxDiscount && <p className="text-red-500 text-xs mt-1">{errors.maxDiscount}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty for no maximum limit
                  </p>
                </div>
              )}

              {/* Usage Limits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      value={formData.expiry}
                      onChange={(e) => handleChange('expiry', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.expiry ? 'border-red-300' : 'border-gray-300'
                      }`}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Usage Limit *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => handleChange('usageLimit', Number(e.target.value))}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.usageLimit ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="1000"
                      min="1"
                    />
                  </div>
                  {errors.usageLimit && <p className="text-red-500 text-xs mt-1">{errors.usageLimit}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Per User Limit *
                  </label>
                  <input
                    type="number"
                    value={formData.perUserLimit}
                    onChange={(e) => handleChange('perUserLimit', Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.perUserLimit ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="1"
                    min="1"
                  />
                  {errors.perUserLimit && <p className="text-red-500 text-xs mt-1">{errors.perUserLimit}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Brief description of the coupon..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}