import { BasePrivateService } from "../baseService";
import { AdminCoupon, CouponStats } from '@/types/coupon';

interface CouponFormData {
  code: string;
  type: 'flat' | 'percent';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiry: string;
  usageLimit: number;
  perUserLimit: number;
  description?: string;
}

interface CouponsResponse {
  coupons: AdminCoupon[];
  stats?: CouponStats;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class AdminCouponsService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  // Get admin coupons with pagination and filters
  async getCoupons(params: any = {}): Promise<CouponsResponse> {
    const response = await this.get<CouponsResponse>("/admin/coupons", params);

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch coupons.",
      );
    }
  }

  // Create new coupon
  async createCoupon(data: CouponFormData): Promise<AdminCoupon> {
    const response = await this.post<{ coupon: AdminCoupon }>("/admin/coupons", {
      action: "create",
      ...data,
    });

    if (response.success) {
      return response.data!.coupon;
    } else {
      throw new Error(
        response.error?.message || "Failed to create coupon.",
      );
    }
  }

  // Update coupon
  async updateCoupon(couponId: string, data: Partial<CouponFormData>): Promise<AdminCoupon> {
    const response = await this.patch<{ coupon: AdminCoupon }>(`/admin/coupons/${couponId}`, data);

    if (response.success) {
      return response.data!.coupon;
    } else {
      throw new Error(
        response.error?.message || "Failed to update coupon.",
      );
    }
  }

  // Delete coupon
  async deleteCoupon(couponId: string): Promise<void> {
    const response = await this.delete(`/admin/coupons/${couponId}`);

    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to delete coupon.",
      );
    }
  }

  // Toggle coupon status
  async toggleCouponStatus(couponId: string, active: boolean): Promise<AdminCoupon> {
    const response = await this.patch<{ coupon: AdminCoupon }>(`/admin/coupons/${couponId}`, {
      active,
    });

    if (response.success) {
      return response.data!.coupon;
    } else {
      throw new Error(
        response.error?.message || "Failed to update coupon status.",
      );
    }
  }

  // Bulk update coupon status
  async bulkUpdateStatus(couponIds: string[], data: { active: boolean }): Promise<{ modifiedCount: number }> {
    const response = await this.patch<{ modifiedCount: number }>("/admin/coupons", {
      action: "bulk-status",
      couponIds,
      ...data,
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to bulk update coupons.",
      );
    }
  }

  // Bulk delete coupons
  async bulkDeleteCoupons(couponIds: string[]): Promise<{ deletedCount: number }> {
    const response = await this.post<{ deletedCount: number }>("/admin/coupons", {
      action: "bulk-delete",
      couponIds,
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to bulk delete coupons.",
      );
    }
  }

  // Export coupons
  async exportCoupons(filters: { statusFilter?: string; searchTerm?: string } = {}): Promise<Blob> {
    const response = await this.get("/admin/coupons", {
      action: "export",
      ...filters,
    });

    if (response.success) {
      // Return blob for download
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