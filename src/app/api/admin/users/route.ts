import { NextRequest } from "next/server";
import { withAdminAuth, AuthenticatedAdmin } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { adminUsersService } from "@/lib/domain/admin/users/AdminUsersService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { AdminUsersQuerySchema, UserStatsQuerySchema } from "@/lib/domain/admin/users/AdminUsersSchemas";

export const GET = withAdminAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, _admin: AuthenticatedAdmin) => {
        const { searchParams } = new URL(request.url);
        
        // Convert searchParams to object for Zod validation
        const queryParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          queryParams[key] = value;
        });

        const userId = searchParams.get("userId");
        
        // Handle user details request
        if (userId) {
          const user = await adminUsersService.getUserById(userId);
          return ApiResponseBuilder.success(user);
        }

        // Check if this is a stats request
        if (queryParams.stats === "true") {
          const validatedQuery = UserStatsQuerySchema.parse(queryParams);
          const stats = await adminUsersService.getUserStats(validatedQuery);
          return ApiResponseBuilder.success(stats);
        }

        // Default: get users list
        const validatedQuery = AdminUsersQuerySchema.parse(queryParams);
        const result = await adminUsersService.getUsers(validatedQuery);

        return ApiResponseBuilder.paginated(
          result.data,
          result.pagination
        );
      },
    ),
  ),
);
