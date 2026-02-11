import { NextRequest } from "next/server";
import { withAdminAuth, AuthenticatedAdmin } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { adminCouponsService } from "@/lib/domain/admin/coupons/AdminCouponsService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { 
  AdminCouponsQuerySchema,
  CouponCreateSchema,
  CouponUpdateSchema
} from "@/lib/domain/admin/coupons/AdminCouponsSchemas";

export const GET = withAdminAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, _admin: AuthenticatedAdmin) => {
        const { searchParams } = new URL(request.url);
        const queryParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          queryParams[key] = value;
        });

        if (queryParams.stats === "true") {
          const stats = await adminCouponsService.getCouponStats();
          return ApiResponseBuilder.success(stats);
        }

        const action = queryParams.action;

        if (action === "export") {
          const validatedQuery = AdminCouponsQuerySchema.parse(queryParams);
          const result = await adminCouponsService.getCoupons(validatedQuery);
          return ApiResponseBuilder.success({
            coupons: result.data,
            exportedAt: new Date().toISOString(),
          });
        }

        const validatedQuery = AdminCouponsQuerySchema.parse(queryParams);
        const result = await adminCouponsService.getCoupons(validatedQuery);

        return ApiResponseBuilder.paginated(
          result.data,
          result.pagination
        );
      },
    ),
  ),
);

export const POST = withAdminAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, _admin: AuthenticatedAdmin) => {
        const body = await request.json();
        const { action } = body;

        if (action === "create") {
          const validatedData = CouponCreateSchema.parse(body);
          const coupon = await adminCouponsService.createCoupon(validatedData);
          return ApiResponseBuilder.success(coupon);
        }

        if (action === "bulk-delete") {
          const { couponIds } = body;
          if (!Array.isArray(couponIds) || couponIds.length === 0) {
            return ApiResponseBuilder.badRequest("couponIds array is required");
          }
          const result = await adminCouponsService.bulkDeleteCoupons(couponIds);
          return ApiResponseBuilder.success(result);
        }

        return ApiResponseBuilder.badRequest("Invalid action specified");
      },
    ),
  ),
);

export const PATCH = withAdminAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, _admin: AuthenticatedAdmin) => {
        const body = await request.json();
        const { action } = body;

        if (action === "bulk-status") {
          const { couponIds, active } = body;
          if (!Array.isArray(couponIds) || couponIds.length === 0) {
            return ApiResponseBuilder.badRequest("couponIds array is required");
          }
          if (typeof active !== "boolean") {
            return ApiResponseBuilder.badRequest("active boolean is required");
          }
          const result = await adminCouponsService.bulkToggleCouponStatus(couponIds, active);
          return ApiResponseBuilder.success({ modifiedCount: result.updatedCount });
        }

        return ApiResponseBuilder.badRequest("Invalid action specified");
      },
    ),
  ),
);
