import { NextRequest } from "next/server";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { notificationsService } from "@/lib/domain/notifications/NotificationsService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import {
  GetNotificationsSchema,
  CreateNotificationSchema,
  UpdateNotificationSchema,
  BulkNotificationSchema,
} from "@/lib/domain/notifications/NotificationsSchemas";
import { getCurrentUserAuth } from "@/lib/middleware/authUtils";

async function getUserFromRequest(request: NextRequest): Promise<{ userId: string; userType: 'seller' | 'admin' } | null> {
  const currentUser = await getCurrentUserAuth(request);
  if (!currentUser) return null;

  return {
    userId: currentUser.user.userId,
    userType: currentUser.userType,
  };
}

// GET - Fetch notifications
export const GET = withDB(
  withRouteErrorHandling(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    // Get user from token
    const user = await getUserFromRequest(request);
    if (!user) {
      return ApiResponseBuilder.unauthorized("Authentication required");
    }

    switch (action) {
      case "unread-count": {
        const result = await notificationsService.getUnreadCount(user.userId, user.userType);
        return ApiResponseBuilder.success(result);
      }

      case "all": {
        // Admin only - get all notifications
        if (user.userType !== 'admin') {
          return ApiResponseBuilder.forbidden("Admin access required");
        }

        const limit = parseInt(searchParams.get("limit") || "50");
        const skip = parseInt(searchParams.get("skip") || "0");
        
        const result = await notificationsService.getAllNotifications({ limit, skip });
        return ApiResponseBuilder.success(result);
      }

      default: {
        // Get user notifications
        const queryParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          queryParams[key] = value;
        });

        const validatedQuery = GetNotificationsSchema.parse(queryParams);
        const result = await notificationsService.getUserNotifications(
          user.userId,
          user.userType,
          validatedQuery,
        );
        return ApiResponseBuilder.success(result);
      }
    }
  }),
);

// POST - Create notification
export const POST = withDB(
  withRouteErrorHandling(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const body = await request.json();

    // Get user from token
    const user = await getUserFromRequest(request);
    if (!user) {
      return ApiResponseBuilder.unauthorized("Authentication required");
    }

    switch (action) {
      case "bulk": {
        // Admin only - create bulk notifications
        if (user.userType !== 'admin') {
          return ApiResponseBuilder.forbidden("Admin access required");
        }

        const validatedData = BulkNotificationSchema.parse(body);
        const result = await notificationsService.createBulkNotifications(validatedData);
        return ApiResponseBuilder.created(result);
      }

      default: {
        // Create single notification
        const validatedData = CreateNotificationSchema.parse(body);
        const result = await notificationsService.createNotification(validatedData);
        return ApiResponseBuilder.created(result);
      }
    }
  }),
);

// PATCH - Update notification (mark as read/dismiss)
export const PATCH = withDB(
  withRouteErrorHandling(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);

    // Get user from token
    const user = await getUserFromRequest(request);
    if (!user) {
      return ApiResponseBuilder.unauthorized("Authentication required");
    }

    // Convert searchParams to object for Zod validation
    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const validatedData = UpdateNotificationSchema.parse(queryParams);
    const result = await notificationsService.updateNotification(
      user.userId,
      user.userType,
      validatedData,
    );
    return ApiResponseBuilder.success(result);
  }),
);

// DELETE - Delete notification (admin only)
export const DELETE = withDB(
  withRouteErrorHandling(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("id");

    if (!notificationId) {
      return ApiResponseBuilder.badRequest("Notification ID is required");
    }

    // Get user from token
    const user = await getUserFromRequest(request);
    if (!user || user.userType !== 'admin') {
      return ApiResponseBuilder.forbidden("Admin access required");
    }

    const result = await notificationsService.deleteNotification(notificationId);
    return ApiResponseBuilder.success(result);
  }),
);