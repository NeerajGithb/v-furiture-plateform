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

        const globalPeriod = searchParams.get('period');
        
        const queryParams: any = {
          refresh: searchParams.get('refresh') || 'false',
        };

        if (globalPeriod) {
          queryParams.overview = { period: globalPeriod };
          queryParams.orders = { period: globalPeriod };
          queryParams.users = { period: globalPeriod };
          queryParams.products = { period: globalPeriod };
          queryParams.sellers = { period: globalPeriod };
          queryParams.payments = { period: globalPeriod };
          queryParams.reviews = { period: globalPeriod };
          queryParams.sales = { period: globalPeriod };
        }

        const validatedQuery = AdminDashboardQuerySchema.parse(queryParams);
        const dashboardStats = await adminDashboardService.getDashboardStats(validatedQuery);
        return ApiResponseBuilder.success(dashboardStats);
      },
    ),
  ),
);

