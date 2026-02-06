import { NextRequest } from "next/server";
import { withSellerAuth } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { sellerInventoryService } from "@/lib/domain/seller/inventory/SellerInventoryService";
import { 
  SellerInventoryQuerySchema, 
  BulkUpdateInventorySchema, 
  InventoryExportSchema 
} from "@/lib/domain/seller/inventory/SellerInventorySchemas";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { AuthenticatedSeller } from "@/lib/middleware/auth";

export const GET = withSellerAuth(
  withDB(
    withRouteErrorHandling(async (request: NextRequest, seller: AuthenticatedSeller) => {
      const { searchParams } = new URL(request.url);
      const queryParams = Object.fromEntries(searchParams.entries());
      
      const validatedQuery = SellerInventoryQuerySchema.parse(queryParams);
      
      // Handle export action
      if (validatedQuery.action === 'export') {
        const exportOptions = InventoryExportSchema.parse(queryParams);
        const exportResult = await sellerInventoryService.exportInventory(seller.id, exportOptions);
        
        return ApiResponseBuilder.success(exportResult, {
          contentType: exportResult.format === 'csv' ? 'text/csv' : 'application/json',
          filename: exportResult.filename
        });
      }
      
      // Handle stats action
      if (validatedQuery.action === 'stats') {
        const result = await sellerInventoryService.getInventoryStats(seller.id, {
          search: validatedQuery.search,
          status: validatedQuery.status,
          period: validatedQuery.period,
        });
        return ApiResponseBuilder.success({ stats: result });
      }
      
      const result = await sellerInventoryService.getInventoryData(seller.id, validatedQuery);
      
      if (result.pagination) {
        return ApiResponseBuilder.paginated(result.inventory, result.pagination, result.stats);
      }
      
      return ApiResponseBuilder.success(result);
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
        const validatedData = BulkUpdateInventorySchema.parse(body);
        
        const result = await sellerInventoryService.bulkUpdateInventory(seller.id, validatedData);
        return ApiResponseBuilder.success(result, { message: result.message });
      }
      
      return ApiResponseBuilder.badRequest("Invalid action");
    })
  )
);