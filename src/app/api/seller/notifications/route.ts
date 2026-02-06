import { NextRequest } from "next/server";
import { withSellerAuth } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { sellerNotificationsService } from "@/lib/domain/seller/notifications/SellerNotificationsService";
import { 
  SellerNotificationsQuerySchema, 
  BulkDeleteNotificationsSchema 
} from "@/lib/domain/seller/notifications/SellerNotificationsSchemas";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { AuthenticatedSeller } from "@/lib/middleware/auth";

export const GET = withSellerAuth(
  withDB(
    withRouteErrorHandling(async (request: NextRequest, seller: AuthenticatedSeller) => {
      const { searchParams } = new URL(request.url);
      const queryParams = Object.fromEntries(searchParams.entries());
      
      const validatedQuery = SellerNotificationsQuerySchema.parse(queryParams);
      
      // Handle unread-count action
      if (validatedQuery.action === 'unread-count') {
        const result = await sellerNotificationsService.getUnreadCount(seller.id);
        return ApiResponseBuilder.success({ count: result });
      }
      
      const result = await sellerNotificationsService.getNotifications(seller.id, validatedQuery);
      
      // Check if result has pagination (normal list response)
      if ('pagination' in result && result.pagination) {
        return ApiResponseBuilder.paginated(result.notifications, result.pagination, result.stats);
      }
      
      return ApiResponseBuilder.success(result);
    })
  )
);

export const POST = withSellerAuth(
  withDB(
    withRouteErrorHandling(async (request: NextRequest, seller: AuthenticatedSeller) => {
      const { searchParams } = new URL(request.url);
      const action = searchParams.get('action') || 'bulk-delete';
      
      if (action === 'bulk-delete') {
        const body = await request.json();
        const validatedData = BulkDeleteNotificationsSchema.parse(body);
        
        const result = await sellerNotificationsService.bulkDeleteNotifications(seller.id, validatedData);
        return ApiResponseBuilder.success(result, { message: result.message });
      }
      
      // Handle other bulk actions
      const body = await request.json();
      const result = await sellerNotificationsService.performBulkAction(seller.id, action, body);
      return ApiResponseBuilder.success(result, { message: result.message });
    })
  )
);

export const DELETE = withSellerAuth(
  withDB(
    withRouteErrorHandling(async (_request: NextRequest, seller: AuthenticatedSeller) => {
      const result = await sellerNotificationsService.clearAllNotifications(seller.id);
      return ApiResponseBuilder.success(result, { message: result.message });
    })
  )
);
