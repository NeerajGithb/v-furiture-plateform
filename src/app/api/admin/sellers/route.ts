import { NextRequest } from "next/server";
import { withAdminAuth, AuthenticatedAdmin } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { adminSellersService } from "@/lib/domain/admin/sellers/AdminSellersService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { AdminSellersQuerySchema, SellerStatusUpdateSchema, SellerVerificationUpdateSchema, SellerStatsQuerySchema } from "@/lib/domain/admin/sellers/AdminSellersSchemas";

export const GET = withAdminAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, _admin: AuthenticatedAdmin) => {
        const { searchParams } = new URL(request.url);
        
        // Convert searchParams to object for Zod validation
        const queryParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          queryParams[key] = value;
        });

        const action = searchParams.get("action");

        // Handle seller-details action
        if (action === "seller-details") {
          const sellerId = searchParams.get("sellerId");
          if (!sellerId) {
            return ApiResponseBuilder.badRequest("Seller ID is required");
          }
          const seller = await adminSellersService.getSellerById(sellerId);
          return ApiResponseBuilder.success(seller);
        }

        // Check if this is a stats request
        if (queryParams.stats === "true") {
          const validatedQuery = SellerStatsQuerySchema.parse(queryParams);
          const stats = await adminSellersService.getSellerStats(validatedQuery);
          return ApiResponseBuilder.success(stats);
        }

        // Default: get sellers list
        const validatedQuery = AdminSellersQuerySchema.parse(queryParams);
        const result = await adminSellersService.getSellers(validatedQuery);

        return ApiResponseBuilder.paginated(
          result.data,
          result.pagination
        );
      },
    ),
  ),
);

export const PATCH = withAdminAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, _admin: AuthenticatedAdmin) => {
        const body = await request.json();
        const action = body.action;

        switch (action) {
          case "update-status": {
            const statusData = SellerStatusUpdateSchema.parse(body);
            const updatedSeller = await adminSellersService.updateSellerStatus(statusData);
            return ApiResponseBuilder.success(updatedSeller);
          }

          case "update-verification": {
            const verificationData = SellerVerificationUpdateSchema.parse(body);
            const verifiedSeller = await adminSellersService.updateSellerVerification(verificationData);
            return ApiResponseBuilder.success(verifiedSeller);
          }

          default:
            return ApiResponseBuilder.badRequest("Invalid action");
        }
      },
    ),
  ),
);
