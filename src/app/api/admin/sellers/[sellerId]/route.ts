import { NextRequest } from "next/server";
import { withAdminAuth, AuthenticatedAdmin } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { adminSellersService } from "@/lib/domain/admin/sellers/AdminSellersService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { SellerStatusUpdateSchema, SellerVerificationSchema } from "@/lib/domain/admin/sellers/AdminSellersSchemas";

interface RouteParams {
  params: Promise<{
    sellerId: string;
  }>;
}

export const GET = withAdminAuth(
  withDB(
    withRouteErrorHandling(
      async (
        _request: NextRequest,
        _admin: AuthenticatedAdmin,
        { params }: RouteParams,
      ) => {
        const { sellerId } = await params;
        const seller = await adminSellersService.getSellerById(sellerId);
        return ApiResponseBuilder.success(seller);
      },
    ),
  ),
);

export const PATCH = withAdminAuth(
  withDB(
    withRouteErrorHandling(
      async (
        request: NextRequest,
        _admin: AuthenticatedAdmin,
        { params }: RouteParams,
      ) => {
        const { sellerId } = await params;
        const body = await request.json();
        const { action } = body;

        switch (action) {
          case "updateStatus":
            const statusData = SellerStatusUpdateSchema.parse({
              sellerId,
              ...body,
            });
            const updatedSeller = await adminSellersService.updateSellerStatus(statusData);
            return ApiResponseBuilder.success(updatedSeller);

          case "updateVerification":
            const verificationData = SellerVerificationSchema.parse({
              sellerId,
              ...body,
            });
            const verifiedSeller = await adminSellersService.updateSellerVerification(verificationData);
            return ApiResponseBuilder.success(verifiedSeller);

          default:
            return ApiResponseBuilder.badRequest("Invalid action specified");
        }
      },
    ),
  ),
);