import { NextRequest } from "next/server";
import { withSellerAuth } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { sellerInventoryService } from "@/lib/domain/seller/inventory/SellerInventoryService";
import { 
  SellerInventoryQuerySchema,
  InventoryStatsQuerySchema
} from "@/lib/domain/seller/inventory/SellerInventorySchemas";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { AuthenticatedSeller } from "@/lib/middleware/auth";

export const GET = withSellerAuth(
  withDB(
    withRouteErrorHandling(async (request: NextRequest, seller: AuthenticatedSeller) => {
      const { searchParams } = new URL(request.url);
      const queryParams = Object.fromEntries(searchParams.entries());
      
      // Handle stats request
      if (queryParams.stats === "true") {
        const validatedQuery = InventoryStatsQuerySchema.parse(queryParams);
        const stats = await sellerInventoryService.getInventoryStats(seller.id, validatedQuery);
        return ApiResponseBuilder.success(stats);
      }
      
      const validatedQuery = SellerInventoryQuerySchema.parse(queryParams);
      
      if (validatedQuery.action === 'low_stock_alerts') {
        const result = await sellerInventoryService.getLowStockAlerts(seller.id, {
          page: validatedQuery.page,
          limit: validatedQuery.limit,
        });
        return ApiResponseBuilder.success(result);
      }
      
      const result = await sellerInventoryService.getInventoryData(seller.id, validatedQuery);
      
      return ApiResponseBuilder.paginated(result.inventory, result.pagination);
    })
  )
);

export const POST = withSellerAuth(
  withDB(
    withRouteErrorHandling(async (request: NextRequest, seller: AuthenticatedSeller) => {
      const body = await request.json();
      const action = body.action;
      
      if (action === 'update_stock') {
        const { productId, quantity, type, reason } = body;
        const result = await sellerInventoryService.updateStock(seller.id, productId, {
          quantity,
          type,
          reason
        });
        return ApiResponseBuilder.success(result);
      }
      
      if (action === 'set_reorder_level') {
        const { productId, reorderLevel } = body;
        const result = await sellerInventoryService.setReorderLevel(seller.id, productId, reorderLevel);
        return ApiResponseBuilder.success(result);
      }
      
      if (action === 'resolve_alert') {
        const { alertId } = body;
        const result = await sellerInventoryService.resolveAlert(seller.id, alertId);
        return ApiResponseBuilder.success(result);
      }
      
      return ApiResponseBuilder.badRequest("Invalid action");
    })
  )
);