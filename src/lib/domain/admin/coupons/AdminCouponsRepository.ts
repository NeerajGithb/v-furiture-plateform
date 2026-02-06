import Coupon from "@/models/Coupon";
import { 
  CouponNotFoundError, 
  CouponCodeExistsError,
  CouponsFetchError,
  CouponCreateError,
  CouponUpdateError,
  CouponDeleteError
} from "./AdminCouponsErrors";
import { IAdminCouponsRepository, AdminCoupon, CouponStats } from "./IAdminCouponsRepository";
import { AdminCouponsQueryRequest, CouponCreateRequest, CouponUpdateRequest } from "./AdminCouponsSchemas";
import { PaginationResult } from "../../shared/types";

export class AdminCouponsRepository implements IAdminCouponsRepository {
  async findMany(query: AdminCouponsQueryRequest): Promise<PaginationResult<AdminCoupon>> {
    try {
      const { page, limit, search, type, isActive, sortBy, sortOrder } = query;
      
      // Build filter
      const filter: any = {};
      if (search) {
        filter.code = { $regex: search, $options: 'i' };
      }
      if (type) {
        filter.type = type;
      }
      if (isActive !== undefined) {
        filter.isActive = isActive;
      }

      // Get total count
      const total = await Coupon.countDocuments(filter);

      // Get coupons
      const coupons = await Coupon.find(filter)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const formattedCoupons: AdminCoupon[] = coupons.map((coupon: any) => ({
        id: coupon._id.toString(),
        code: coupon.code,
        type: coupon.type,
        discount: coupon.discount,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscount: coupon.maxDiscount,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount || 0,
        expiryDate: coupon.expiryDate,
        isActive: coupon.isActive,
        createdAt: coupon.createdAt,
        updatedAt: coupon.updatedAt,
      }));

      return {
        data: formattedCoupons,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error("Error fetching coupons:", error);
      throw new CouponsFetchError();
    }
  }

  async findById(id: string): Promise<AdminCoupon | null> {
    try {
      const coupon = await Coupon.findById(id).lean();
      if (!coupon) return null;

      return {
        id: coupon._id.toString(),
        code: coupon.code,
        type: coupon.type,
        discount: coupon.discount,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscount: coupon.maxDiscount,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount || 0,
        expiryDate: coupon.expiryDate,
        isActive: coupon.isActive,
        createdAt: coupon.createdAt,
        updatedAt: coupon.updatedAt,
      };
    } catch (error) {
      console.error("Error fetching coupon by ID:", error);
      throw new CouponsFetchError();
    }
  }

  async findByCode(code: string): Promise<AdminCoupon | null> {
    try {
      const coupon = await Coupon.findOne({ code }).lean();
      if (!coupon) return null;

      return {
        id: coupon._id.toString(),
        code: coupon.code,
        type: coupon.type,
        discount: coupon.discount,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscount: coupon.maxDiscount,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount || 0,
        expiryDate: coupon.expiryDate,
        isActive: coupon.isActive,
        createdAt: coupon.createdAt,
        updatedAt: coupon.updatedAt,
      };
    } catch (error) {
      console.error("Error fetching coupon by code:", error);
      throw new CouponsFetchError();
    }
  }

  async getStats(): Promise<CouponStats> {
    try {
      const now = new Date();
      
      const stats = await Coupon.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ['$isActive', true] }, { $gt: ['$expiryDate', now] }] },
                  1,
                  0
                ]
              }
            },
            expired: {
              $sum: {
                $cond: [{ $lte: ['$expiryDate', now] }, 1, 0]
              }
            }
          }
        }
      ]);

      const mostUsed = await Coupon.find({})
        .sort({ usedCount: -1 })
        .limit(5)
        .select('code usedCount')
        .lean();

      return {
        total: stats[0]?.total || 0,
        active: stats[0]?.active || 0,
        expired: stats[0]?.expired || 0,
        mostUsed: mostUsed.map((coupon: any) => ({
          id: coupon._id.toString(),
          code: coupon.code,
          usedCount: coupon.usedCount || 0,
        })),
        totalSavings: 0, // This would need order data to calculate
      };
    } catch (error) {
      console.error("Error fetching coupon stats:", error);
      throw new CouponsFetchError();
    }
  }

  async create(data: CouponCreateRequest): Promise<AdminCoupon> {
    try {
      // Check if code already exists
      const existingCoupon = await Coupon.findOne({ code: data.code });
      if (existingCoupon) {
        throw new CouponCodeExistsError(data.code);
      }

      const coupon = new Coupon({
        ...data,
        usedCount: 0,
      });

      await coupon.save();

      return {
        id: coupon._id.toString(),
        code: coupon.code,
        type: coupon.type,
        discount: coupon.discount,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscount: coupon.maxDiscount,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount,
        expiryDate: coupon.expiryDate,
        isActive: coupon.isActive,
        createdAt: coupon.createdAt,
        updatedAt: coupon.updatedAt,
      };
    } catch (error) {
      if (error instanceof CouponCodeExistsError) {
        throw error;
      }
      console.error("Error creating coupon:", error);
      throw new CouponCreateError();
    }
  }

  async update(id: string, data: CouponUpdateRequest): Promise<AdminCoupon> {
    try {
      // Check if code already exists (if updating code)
      if (data.code) {
        const existingCoupon = await Coupon.findOne({ code: data.code, _id: { $ne: id } });
        if (existingCoupon) {
          throw new CouponCodeExistsError(data.code);
        }
      }

      const coupon = await Coupon.findByIdAndUpdate(
        id,
        { ...data, updatedAt: new Date() },
        { new: true }
      );

      if (!coupon) {
        throw new CouponNotFoundError(id);
      }

      return {
        id: coupon._id.toString(),
        code: coupon.code,
        type: coupon.type,
        discount: coupon.discount,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscount: coupon.maxDiscount,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount,
        expiryDate: coupon.expiryDate,
        isActive: coupon.isActive,
        createdAt: coupon.createdAt,
        updatedAt: coupon.updatedAt,
      };
    } catch (error) {
      if (error instanceof CouponNotFoundError || error instanceof CouponCodeExistsError) {
        throw error;
      }
      console.error("Error updating coupon:", error);
      throw new CouponUpdateError();
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await Coupon.findByIdAndDelete(id);
      if (!result) {
        throw new CouponNotFoundError(id);
      }
    } catch (error) {
      if (error instanceof CouponNotFoundError) {
        throw error;
      }
      console.error("Error deleting coupon:", error);
      throw new CouponDeleteError();
    }
  }

  async toggleStatus(id: string, isActive: boolean): Promise<AdminCoupon> {
    try {
      const coupon = await Coupon.findByIdAndUpdate(
        id,
        { isActive, updatedAt: new Date() },
        { new: true }
      );

      if (!coupon) {
        throw new CouponNotFoundError(id);
      }

      return {
        id: coupon._id.toString(),
        code: coupon.code,
        type: coupon.type,
        discount: coupon.discount,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscount: coupon.maxDiscount,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount,
        expiryDate: coupon.expiryDate,
        isActive: coupon.isActive,
        createdAt: coupon.createdAt,
        updatedAt: coupon.updatedAt,
      };
    } catch (error) {
      if (error instanceof CouponNotFoundError) {
        throw error;
      }
      console.error("Error toggling coupon status:", error);
      throw new CouponUpdateError();
    }
  }

  async bulkDelete(ids: string[]): Promise<{ deletedCount: number }> {
    try {
      const result = await Coupon.deleteMany({ _id: { $in: ids } });
      return { deletedCount: result.deletedCount || 0 };
    } catch (error) {
      console.error("Error bulk deleting coupons:", error);
      throw new CouponDeleteError();
    }
  }

  async bulkToggleStatus(ids: string[], isActive: boolean): Promise<{ updatedCount: number }> {
    try {
      const result = await Coupon.updateMany(
        { _id: { $in: ids } },
        { isActive, updatedAt: new Date() }
      );
      return { updatedCount: result.modifiedCount || 0 };
    } catch (error) {
      console.error("Error bulk toggling coupon status:", error);
      throw new CouponUpdateError();
    }
  }
}

export const adminCouponsRepository = new AdminCouponsRepository();