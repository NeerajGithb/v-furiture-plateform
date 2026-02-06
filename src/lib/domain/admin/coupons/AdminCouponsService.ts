import { adminCouponsRepository } from "./AdminCouponsRepository";
import { AdminCouponsQueryRequest, CouponCreateRequest, CouponUpdateRequest } from "./AdminCouponsSchemas";

export class AdminCouponsService {
  async getCoupons(query: AdminCouponsQueryRequest) {
    return await adminCouponsRepository.findMany(query);
  }

  async getCouponById(id: string) {
    const coupon = await adminCouponsRepository.findById(id);
    if (!coupon) {
      throw new Error(`Coupon with ID ${id} not found`);
    }
    return coupon;
  }

  async getCouponByCode(code: string) {
    return await adminCouponsRepository.findByCode(code);
  }

  async getCouponStats() {
    return await adminCouponsRepository.getStats();
  }

  async createCoupon(data: CouponCreateRequest) {
    return await adminCouponsRepository.create(data);
  }

  async updateCoupon(id: string, data: CouponUpdateRequest) {
    return await adminCouponsRepository.update(id, data);
  }

  async deleteCoupon(id: string) {
    return await adminCouponsRepository.delete(id);
  }

  async toggleCouponStatus(id: string, isActive: boolean) {
    return await adminCouponsRepository.toggleStatus(id, isActive);
  }

  async bulkDeleteCoupons(ids: string[]) {
    return await adminCouponsRepository.bulkDelete(ids);
  }

  async bulkToggleCouponStatus(ids: string[], isActive: boolean) {
    return await adminCouponsRepository.bulkToggleStatus(ids, isActive);
  }
}

export const adminCouponsService = new AdminCouponsService();