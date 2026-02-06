import { NextRequest } from "next/server";
import { withSellerAuth } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { sellerNotificationsService } from "@/lib/domain/seller/notifications/SellerNotificationsService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { AuthenticatedSeller } from "@/lib/middleware/auth";

export const GET = withSellerAuth(
  withDB(
    withRouteErrorHandling(async (
      request: NextRequest, 
      seller: AuthenticatedSeller,
      { params }: { params: Promise<{ notificationId: string }> }
    ) => {
      const { notificationId } = await params;
      
      const result = await sellerNotificationsService.getNotificationById(seller.id, notificationId);
      return ApiResponseBuilder.success({ notification: result });
    })
  )
);

export const PUT = withSellerAuth(
  withDB(
    withRouteErrorHandling(async (
      request: NextRequest, 
      seller: AuthenticatedSeller,
      { params }: { params: Promise<{ notificationId: string }> }
    ) => {
      const { notificationId } = await params;
      
      const result = await sellerNotificationsService.markAsRead(notificationId, seller.id);
      return ApiResponseBuilder.success(result, { message: result.message });
    })
  )
);

export const DELETE = withSellerAuth(
  withDB(
    withRouteErrorHandling(async (
      request: NextRequest, 
      seller: AuthenticatedSeller,
      { params }: { params: Promise<{ notificationId: string }> }
    ) => {
      const { notificationId } = await params;
      
      const result = await sellerNotificationsService.deleteNotification(notificationId, seller.id);
      return ApiResponseBuilder.success(result, { message: result.message });
    })
  )
);

// Keep PATCH for backward compatibility
export const PATCH = PUT;
