import { NextRequest } from "next/server";
import { withAdminAuth, AuthenticatedAdmin } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { adminAnalyticsService } from "@/lib/domain/admin/analytics/AdminAnalyticsService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { AdminAnalyticsQuerySchema, AnalyticsExportSchema } from "@/lib/domain/admin/analytics/AdminAnalyticsSchemas";

export const GET = withAdminAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, _admin: AuthenticatedAdmin) => {
        const { searchParams } = new URL(request.url);

        const queryParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          queryParams[key] = value;
        });

        if (queryParams.action === "export") {
          const exportQuery = AnalyticsExportSchema.parse(queryParams);
          const exportResult = await adminAnalyticsService.exportAnalytics(exportQuery);
          return ApiResponseBuilder.success(exportResult);
        }

        const validatedQuery = AdminAnalyticsQuerySchema.parse(queryParams);
        const analyticsData = await adminAnalyticsService.getCompleteAnalytics(validatedQuery);
        return ApiResponseBuilder.success(analyticsData);
      },
    ),
  ),
);