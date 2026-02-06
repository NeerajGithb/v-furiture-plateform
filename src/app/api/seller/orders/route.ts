import { NextRequest } from "next/server";
import { withSellerAuth } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { sellerOrdersService } from "@/lib/domain/seller/orders/SellerOrdersService";
import { 
  SellerOrdersQuerySchema, 
  BulkOrderUpdateSchema, 
  OrderExportSchema 
} from "@/lib/domain/seller/orders/SellerOrdersSchemas";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { AuthenticatedSeller } from "@/lib/middleware/auth";

export const GET = withSellerAuth(
  withDB(
    withRouteErrorHandling(async (request: NextRequest, seller: AuthenticatedSeller) => {
      const { searchParams } = new URL(request.url);
      const queryParams = Object.fromEntries(searchParams.entries());
      
      const validatedQuery = SellerOrdersQuerySchema.parse(queryParams);
      
      // Handle export action
      if (validatedQuery.action === 'export') {
        const exportOptions = OrderExportSchema.parse(queryParams);
        const exportResult = await sellerOrdersService.exportOrders(seller.id, exportOptions);
        
        return ApiResponseBuilder.success(exportResult, {
          contentType: exportResult.format === 'csv' ? 'text/csv' : 'application/json',
          filename: exportResult.filename
        });
      }
      
      // Handle stats action
      if (validatedQuery.action === 'stats') {
        const result = await sellerOrdersService.getOrdersStats(seller.id, {
          status: validatedQuery.status,
          period: validatedQuery.period,
        });
        return ApiResponseBuilder.success({ stats: result });
      }
      
      const result = await sellerOrdersService.getOrdersData(seller.id, validatedQuery);
      
      // Check if result has pagination (normal list response)
      if ('pagination' in result && result.pagination) {
        return ApiResponseBuilder.paginated(result.orders, result.pagination, result.stats);
      }
      
      return ApiResponseBuilder.success(result);
    })
  )
);

export const POST = withSellerAuth(
  withDB(
    withRouteErrorHandling(async (request: NextRequest, seller: AuthenticatedSeller) => {
      const { searchParams } = new URL(request.url);
      const action = searchParams.get('action') || 'bulk-update';
      
      if (action === 'bulk-update') {
        const body = await request.json();
        const validatedData = BulkOrderUpdateSchema.parse(body);
        
        const result = await sellerOrdersService.bulkUpdateOrders(seller.id, validatedData);
        return ApiResponseBuilder.success(result, { message: result.message });
      }
      
      return ApiResponseBuilder.badRequest("Invalid action");
    })
  )
);
