import { NextRequest } from "next/server";
import { withSellerAuth } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { sellerCategoriesService } from "@/lib/domain/seller/categories/SellerCategoriesService";
import { SellerCategoriesQuerySchema } from "@/lib/domain/seller/categories/SellerCategoriesSchemas";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { AuthenticatedSeller } from "@/lib/middleware/auth";

export const GET = withSellerAuth(
  withDB(
    withRouteErrorHandling(async (request: NextRequest, seller: AuthenticatedSeller) => {
      const { searchParams } = new URL(request.url);
      const queryParams = Object.fromEntries(searchParams.entries());
      
      const validatedQuery = SellerCategoriesQuerySchema.parse(queryParams);
      const result = await sellerCategoriesService.getCategories(validatedQuery);
      
      return ApiResponseBuilder.success(result);
    })
  )
);
