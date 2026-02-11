import { NextRequest } from "next/server";
import { withSellerAuth } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { sellerOrdersService } from "@/lib/domain/seller/orders/SellerOrdersService";
import { 
  SellerOrdersQuerySchema,
  OrderStatsQuerySchema,
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
      
      // Handle stats request
      if (queryParams.stats === "true") {
        const validatedQuery = OrderStatsQuerySchema.parse(queryParams);
        const stats = await sellerOrdersService.getOrdersStats(seller.id, validatedQuery);
        return ApiResponseBuilder.success(stats);
      }
      
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
      
      const result = await sellerOrdersService.getOrdersData(seller.id, validatedQuery);
      
      const pagination = {
        page: validatedQuery.page || 1,
        limit: validatedQuery.limit || 20,
        total: result.total,
        totalPages: Math.ceil(result.total / (validatedQuery.limit || 20)),
        hasNext: (validatedQuery.page || 1) < Math.ceil(result.total / (validatedQuery.limit || 20)),
        hasPrev: (validatedQuery.page || 1) > 1,
      };
      
      return ApiResponseBuilder.paginated(result.orders, pagination);
    })
  )
);

export const POST = withSellerAuth(
  withDB(
    withRouteErrorHandling(async (request: NextRequest, seller: AuthenticatedSeller) => {
      const { searchParams } = new URL(request.url);
      const action = searchParams.get('action');
      
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
