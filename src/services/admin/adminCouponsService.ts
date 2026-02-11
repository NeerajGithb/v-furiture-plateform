import { BasePrivateService } from "../baseService";
import { AdminCoupon, CouponStats, AdminCouponsQueryRequest, CouponCreateRequest, CouponUpdateRequest } from '@/types/admin/coupons';
import { PaginationResult } from '@/lib/domain/shared/types';

class AdminCouponsService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  async getCoupons(params: Partial<AdminCouponsQueryRequest> = {}): Promise<PaginationResult<AdminCoupon>> {
    return await this.getPaginated<AdminCoupon>("/admin/coupons", params);
  }

  async getCouponStats(): Promise<CouponStats> {
    const response = await this.get("/admin/coupons", { stats: "true" });

    if (response.success) {
      return response.data as CouponStats;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch coupon stats.",
      );
    }
  }

  async createCoupon(data: CouponCreateRequest): Promise<AdminCoupon> {
    const response = await this.post("/admin/coupons", {
      action: "create",
      code: data.code,
      type: data.type,
      discount: data.discount,
      minOrderAmount: data.minOrderAmount,
      maxDiscount: data.maxDiscount,
      expiryDate: data.expiryDate,
      usageLimit: data.usageLimit,
      isActive: data.isActive,
    });

    if (response.success) {
      const responseData = response.data as { coupon: AdminCoupon };
      return responseData.coupon;
    } else {
      throw new Error(
        response.error?.message || "Failed to create coupon.",
      );
    }
  }

  async updateCoupon(couponId: string, data: CouponUpdateRequest): Promise<AdminCoupon> {
    const updateData: any = {};
    if (data.code) updateData.code = data.code;
    if (data.type) updateData.type = data.type;
    if (data.discount !== undefined) updateData.discount = data.discount;
    if (data.minOrderAmount !== undefined) updateData.minOrderAmount = data.minOrderAmount;
    if (data.maxDiscount !== undefined) updateData.maxDiscount = data.maxDiscount;
    if (data.expiryDate) updateData.expiryDate = data.expiryDate;
    if (data.usageLimit !== undefined) updateData.usageLimit = data.usageLimit;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const response = await this.patch(`/admin/coupons/${couponId}`, updateData);

    if (response.success) {
      return response.data as AdminCoupon;
    } else {
      throw new Error(
        response.error?.message || "Failed to update coupon.",
      );
    }
  }

  async deleteCoupon(couponId: string): Promise<void> {
    const response = await this.delete(`/admin/coupons/${couponId}`);

    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to delete coupon.",
      );
    }
  }

  async toggleCouponStatus(couponId: string, active: boolean): Promise<AdminCoupon> {
    const response = await this.patch(`/admin/coupons/${couponId}`, {
      isActive: active,
    });

    if (response.success) {
      return response.data as AdminCoupon;
    } else {
      throw new Error(
        response.error?.message || "Failed to update coupon status.",
      );
    }
  }

  async bulkUpdateStatus(couponIds: string[], data: { active: boolean }): Promise<{ modifiedCount: number }> {
    const response = await this.patch("/admin/coupons", {
      action: "bulk-status",
      couponIds,
      active: data.active,
    });

    if (response.success) {
      return response.data as { modifiedCount: number };
    } else {
      throw new Error(
        response.error?.message || "Failed to bulk update coupons.",
      );
    }
  }

  async bulkDeleteCoupons(couponIds: string[]): Promise<{ deletedCount: number }> {
    const response = await this.post("/admin/coupons", {
      action: "bulk-delete",
      couponIds,
    });

    if (response.success) {
      return response.data as { deletedCount: number };
    } else {
      throw new Error(
        response.error?.message || "Failed to bulk delete coupons.",
      );
    }
  }

  async exportCoupons(filters: { statusFilter?: string; searchTerm?: string } = {}): Promise<Blob> {
    const response = await this.get("/admin/coupons", {
      action: "export",
      ...filters,
    });

    if (response.success) {
      return new Blob([JSON.stringify(response.data)], { type: 'application/json' });
    } else {
      throw new Error(
        response.error?.message || "Failed to export coupons.",
      );
    }
  }
}

// Export singleton instance
export const adminCouponsService = new AdminCouponsService();