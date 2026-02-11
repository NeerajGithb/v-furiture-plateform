import { NextRequest } from "next/server";
import { withAdminAuth, AuthenticatedAdmin } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { adminCouponsService } from "@/lib/domain/admin/coupons/AdminCouponsService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { CouponUpdateSchema } from "@/lib/domain/admin/coupons/AdminCouponsSchemas";

export const GET = withAdminAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, _admin: AuthenticatedAdmin, { params }: { params: Promise<{ id: string }> }) => {
        const { id: couponId } = await params;
        const coupon = await adminCouponsService.getCouponById(couponId);
        return ApiResponseBuilder.success(coupon);
      },
    ),
  ),
);

export const PATCH = withAdminAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, _admin: AuthenticatedAdmin, { params }: { params: Promise<{ id: string }> }) => {
        const { id: couponId } = await params;
        const body = await request.json();
        const validatedData = CouponUpdateSchema.parse(body);
        const updatedCoupon = await adminCouponsService.updateCoupon(couponId, validatedData);
        return ApiResponseBuilder.success(updatedCoupon);
      },
    ),
  ),
);

export const DELETE = withAdminAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, _admin: AuthenticatedAdmin, { params }: { params: Promise<{ id: string }> }) => {
        const { id: couponId } = await params;
        await adminCouponsService.deleteCoupon(couponId);
        return ApiResponseBuilder.success({ message: "Coupon deleted successfully" });
      },
    ),
  ),
);
