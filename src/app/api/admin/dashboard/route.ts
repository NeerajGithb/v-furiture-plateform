import { NextRequest } from "next/server";
import { withAdminAuth, AuthenticatedAdmin } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { adminDashboardService } from "@/lib/domain/admin/dashboard/AdminDashboardService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { AdminDashboardQuerySchema } from "@/lib/domain/admin/dashboard/AdminDashboardSchemas";

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

        // Validate query parameters
        const validatedQuery = AdminDashboardQuerySchema.parse(queryParams);

        const dashboardStats = await adminDashboardService.getDashboardStats(validatedQuery);
        return ApiResponseBuilder.success(dashboardStats);
      },
    ),
  ),
);

