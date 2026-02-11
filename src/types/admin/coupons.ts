export type {
  AdminCoupon,
  CouponStats,
  IAdminCouponsRepository
} from '@/lib/domain/admin/coupons/IAdminCouponsRepository';

export type {
  AdminCouponsQueryRequest,
  CouponCreateRequest,
  CouponUpdateRequest
} from '@/lib/domain/admin/coupons/AdminCouponsSchemas';

// Coupon type enum
export type CouponType = 'percentage' | 'fixed';
