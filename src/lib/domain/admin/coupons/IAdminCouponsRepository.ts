import { AdminCouponsQueryRequest, CouponCreateRequest, CouponUpdateRequest } from "./AdminCouponsSchemas";
import { PaginationResult } from "../../shared/types";

export interface AdminCoupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  discount: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  expiryDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponStats {
  total: number;
  active: number;
  expired: number;
  mostUsed: Array<{
    id: string;
    code: string;
    usedCount: number;
  }>;
  totalSavings: number;
}

export interface IAdminCouponsRepository {
  // Coupon queries
  findMany(query: AdminCouponsQueryRequest): Promise<PaginationResult<AdminCoupon>>;
  findById(id: string): Promise<AdminCoupon | null>;
  findByCode(code: string): Promise<AdminCoupon | null>;
  getStats(): Promise<CouponStats>;
  
  // Coupon management
  create(data: CouponCreateRequest): Promise<AdminCoupon>;
  update(id: string, data: CouponUpdateRequest): Promise<AdminCoupon>;
  delete(id: string): Promise<void>;
  toggleStatus(id: string, isActive: boolean): Promise<AdminCoupon>;
  
  // Bulk operations
  bulkDelete(ids: string[]): Promise<{ deletedCount: number }>;
  bulkToggleStatus(ids: string[], isActive: boolean): Promise<{ updatedCount: number }>;
}