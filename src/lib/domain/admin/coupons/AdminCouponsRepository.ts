import Coupon from "@/models/Coupon";
import { 
  CouponNotFoundError, 
  CouponCodeExistsError
} from "./AdminCouponsErrors";
import { IAdminCouponsRepository, AdminCoupon, CouponStats } from "./IAdminCouponsRepository";
import { AdminCouponsQueryRequest, CouponCreateRequest, CouponUpdateRequest } from "./AdminCouponsSchemas";
import { PaginationResult } from "../../shared/types";
import { getStartDateFromPeriod } from "../../shared/dateUtils";

export class AdminCouponsRepository implements IAdminCouponsRepository {
  async findMany(query: AdminCouponsQueryRequest): Promise<PaginationResult<AdminCoupon>> {
    const { page, limit, search, type, isActive, period, sortBy, sortOrder } = query;
    
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
    if (period) {
      const startDate = getStartDateFromPeriod(period);
      filter.createdAt = { $gte: startDate };
    }

    const total = await Coupon.countDocuments(filter);

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
  }

  async findById(id: string): Promise<AdminCoupon | null> {
    const coupon = await Coupon.findById(id).lean() as any;
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
  }

  async findByCode(code: string): Promise<AdminCoupon | null> {
    const coupon = await Coupon.findOne({ code }).lean() as any;
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
  }

  async getStats(): Promise<CouponStats> {
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
      totalSavings: 0,
    };
  }

  async create(data: CouponCreateRequest): Promise<AdminCoupon> {
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
  }

  async update(id: string, data: CouponUpdateRequest): Promise<AdminCoupon> {
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
  }

  async delete(id: string): Promise<void> {
    const result = await Coupon.findByIdAndDelete(id);
    if (!result) {
      throw new CouponNotFoundError(id);
    }
  }

  async toggleStatus(id: string, isActive: boolean): Promise<AdminCoupon> {
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
  }

  async bulkDelete(ids: string[]): Promise<{ deletedCount: number }> {
    const result = await Coupon.deleteMany({ _id: { $in: ids } });
    return { deletedCount: result.deletedCount || 0 };
  }

  async bulkToggleStatus(ids: string[], isActive: boolean): Promise<{ updatedCount: number }> {
    const result = await Coupon.updateMany(
      { _id: { $in: ids } },
      { isActive, updatedAt: new Date() }
    );
    return { updatedCount: result.modifiedCount || 0 };
  }
}

export const adminCouponsRepository = new AdminCouponsRepository();
