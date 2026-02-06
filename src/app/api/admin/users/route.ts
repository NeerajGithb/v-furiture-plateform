import { NextRequest } from "next/server";
import { withAdminAuth, AuthenticatedAdmin } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { adminUsersService } from "@/lib/domain/admin/users/AdminUsersService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { AdminUsersQuerySchema, UserStatusUpdateSchema } from "@/lib/domain/admin/users/AdminUsersSchemas";

export const GET = withAdminAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, _admin: AuthenticatedAdmin) => {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get("action");
        const userId = searchParams.get("userId");

        // Handle different actions
        switch (action) {
          case "user-details":
            const user = await adminUsersService.getUserById(userId!);
            return ApiResponseBuilder.success(user);

          case "user-orders":
            const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
            const orders = await adminUsersService.getUserOrderHistory(userId!, limit);
            return ApiResponseBuilder.success(orders);

          case "stats":
            const period = searchParams.get("period") || "30d";
            const stats = await adminUsersService.getUserStats(period);
            return ApiResponseBuilder.success(stats);

          default:
            // Default: get users list
            const queryParams: Record<string, string> = {};
            searchParams.forEach((value, key) => {
              queryParams[key] = value;
            });

            const validatedQuery = AdminUsersQuerySchema.parse(queryParams);
            const result = await adminUsersService.getUsers(validatedQuery);

            return ApiResponseBuilder.paginated(
              result.data,
              result.pagination
            );
        }
      },
    ),
  ),
);

export const PATCH = withAdminAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, admin: AuthenticatedAdmin) => {
        const body = await request.json();
        const action = body.action;

        switch (action) {
          case "update-status":
            const validatedData = UserStatusUpdateSchema.parse({
              ...body,
              moderatedBy: admin.id
            });
            const result = await adminUsersService.updateUserStatus(validatedData);
            return ApiResponseBuilder.success(result);

          case "add-note":
            const userWithNote = await adminUsersService.addUserNote(body.userId, body.note);
            return ApiResponseBuilder.success(userWithNote);

          default:
            return ApiResponseBuilder.error("Invalid action");
        }
      },
    ),
  ),
);
