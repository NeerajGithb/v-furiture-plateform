import { NextRequest } from "next/server";
import { withSellerAuth } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { sellerDashboardService } from "@/lib/domain/seller/dashboard/SellerDashboardService";
import { SellerDashboardQuerySchema } from "@/lib/domain/seller/dashboard/SellerDashboardSchemas";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { AuthenticatedSeller } from "@/lib/middleware/auth";

export const GET = withSellerAuth(
  withDB(
    withRouteErrorHandling(async (request: NextRequest, seller: AuthenticatedSeller) => {
      const { searchParams } = new URL(request.url);
      const queryParams = Object.fromEntries(searchParams.entries());
      
      const validatedQuery = SellerDashboardQuerySchema.parse(queryParams);
      const result = await sellerDashboardService.getDashboardData(seller.id, validatedQuery);
      
      return ApiResponseBuilder.success(result);
    })
  )
);
