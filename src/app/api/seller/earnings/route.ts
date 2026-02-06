import { NextRequest } from "next/server";
import { withSellerAuth } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { sellerEarningsService } from "@/lib/domain/seller/earnings/SellerEarningsService";
import { 
  SellerEarningsQuerySchema, 
  PayoutRequestSchema, 
  EarningsExportSchema 
} from "@/lib/domain/seller/earnings/SellerEarningsSchemas";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { AuthenticatedSeller } from "@/lib/middleware/auth";

export const GET = withSellerAuth(
  withDB(
    withRouteErrorHandling(async (request: NextRequest, seller: AuthenticatedSeller) => {
      const { searchParams } = new URL(request.url);
      const queryParams = Object.fromEntries(searchParams.entries());
      
      const validatedQuery = SellerEarningsQuerySchema.parse(queryParams);
      
      // Handle export action
      if (validatedQuery.action === 'export') {
        const exportOptions = EarningsExportSchema.parse(queryParams);
        const exportResult = await sellerEarningsService.exportEarnings(seller.id, exportOptions);
        
        return ApiResponseBuilder.success(exportResult, {
          contentType: exportResult.format === 'csv' ? 'text/csv' : 'application/json',
          filename: exportResult.filename
        });
      }

      // Handle payouts action
      if (validatedQuery.action === 'payouts') {
        const result = await sellerEarningsService.getPayoutHistory(seller.id, {
          page: validatedQuery.page || 1,
          limit: validatedQuery.limit || 10,
          status: validatedQuery.status,
        });
        return ApiResponseBuilder.paginated(result.payouts, {
          page: validatedQuery.page || 1,
          limit: validatedQuery.limit || 10,
          total: result.total,
          totalPages: Math.ceil(result.total / (validatedQuery.limit || 10)),
          hasNext: (validatedQuery.page || 1) < Math.ceil(result.total / (validatedQuery.limit || 10)),
          hasPrev: (validatedQuery.page || 1) > 1,
        });
      }
      
      const result = await sellerEarningsService.getEarningsData(seller.id, validatedQuery);
      return ApiResponseBuilder.success(result);
    })
  )
);

export const POST = withSellerAuth(
  withDB(
    withRouteErrorHandling(async (request: NextRequest, seller: AuthenticatedSeller) => {
      const { searchParams } = new URL(request.url);
      const action = searchParams.get('action');
      
      if (action === 'payout') {
        const body = await request.json();
        const validatedData = PayoutRequestSchema.parse(body);
        
        const result = await sellerEarningsService.requestPayout(seller.id, validatedData);
        return ApiResponseBuilder.success(result, { message: "Payout request submitted successfully" });
      }
      
      return ApiResponseBuilder.error("Invalid action", 400);
    })
  )
);
