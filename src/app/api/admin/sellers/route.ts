import { NextRequest } from "next/server";
import { withAdminAuth, AuthenticatedAdmin } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { adminSellersService } from "@/lib/domain/admin/sellers/AdminSellersService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { AdminSellersQuerySchema, SellerStatusUpdateSchema, SellerVerificationUpdateSchema } from "@/lib/domain/admin/sellers/AdminSellersSchemas";

export const GET = withAdminAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, _admin: AuthenticatedAdmin) => {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get("action");
        const sellerId = searchParams.get("sellerId");

        switch (action) {
          case "seller-details":
            const seller = await adminSellersService.getSellerById(sellerId!);
            return ApiResponseBuilder.success(seller);

          case "stats":
            const period = searchParams.get("period") || "30d";
            const stats = await adminSellersService.getSellerStats(period);
            return ApiResponseBuilder.success(stats);

          default:
            const queryParams: Record<string, string> = {};
            searchParams.forEach((value, key) => {
              queryParams[key] = value;
            });

            const validatedQuery = AdminSellersQuerySchema.parse(queryParams);
            const result = await adminSellersService.getSellers(validatedQuery);

            return ApiResponseBuilder.paginated(
              result.data,
              result.pagination
            );
        }
      },
    ),
  ),
);

export const PATCH = withAdminAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, admin: AuthenticatedAdmin) => {
        const body = await request.json();
        const action = body.action;

        switch (action) {
          case "update-status":
            const statusData = SellerStatusUpdateSchema.parse(body);
            const updatedSeller = await adminSellersService.updateSellerStatus(statusData);
            return ApiResponseBuilder.success(updatedSeller);

          case "update-verification":
            const verificationData = SellerVerificationUpdateSchema.parse(body);
            const verifiedSeller = await adminSellersService.updateSellerVerification(verificationData);
            return ApiResponseBuilder.success(verifiedSeller);

          default:
            return ApiResponseBuilder.error("Invalid action");
        }
      },
    ),
  ),
);
