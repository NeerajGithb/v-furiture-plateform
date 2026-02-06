import { NextRequest } from "next/server";
import { withSellerAuth } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { sellerSubcategoriesService } from "@/lib/domain/seller/subcategories/SellerSubcategoriesService";
import { SellerSubcategoriesQuerySchema } from "@/lib/domain/seller/subcategories/SellerSubcategoriesSchemas";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { AuthenticatedSeller } from "@/lib/middleware/auth";

export const GET = withSellerAuth(
  withDB(
    withRouteErrorHandling(async (request: NextRequest, seller: AuthenticatedSeller) => {
      const { searchParams } = new URL(request.url);
      const queryParams = Object.fromEntries(searchParams.entries());
      
      const validatedQuery = SellerSubcategoriesQuerySchema.parse(queryParams);
      const result = await sellerSubcategoriesService.getSubcategories(validatedQuery);
      
      return ApiResponseBuilder.success(result);
    })
  )
);
