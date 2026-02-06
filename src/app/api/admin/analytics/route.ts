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

        // Convert searchParams to object for Zod validation
        const queryParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          queryParams[key] = value;
        });

        const action = searchParams.get("action");

        switch (action) {
          case "export":
            const exportQuery = AnalyticsExportSchema.parse(queryParams);
            const exportResult = await adminAnalyticsService.exportAnalytics(exportQuery);
            return ApiResponseBuilder.success(exportResult);

          case "realtime":
            const realTimeStats = await adminAnalyticsService.getRealTimeStats();
            return ApiResponseBuilder.success(realTimeStats);

          case "overview":
            const validatedQuery = AdminAnalyticsQuerySchema.parse(queryParams);
            const overview = await adminAnalyticsService.getAnalyticsOverview(validatedQuery);
            return ApiResponseBuilder.success(overview);

          case "metrics":
            const metricsQuery = AdminAnalyticsQuerySchema.parse(queryParams);
            const metrics = await adminAnalyticsService.getAnalyticsMetrics(metricsQuery);
            return ApiResponseBuilder.success(metrics);

          case "performers":
            const performersQuery = AdminAnalyticsQuerySchema.parse(queryParams);
            const performers = await adminAnalyticsService.getTopPerformers(performersQuery);
            return ApiResponseBuilder.success(performers);

          case "users":
            const usersQuery = AdminAnalyticsQuerySchema.parse(queryParams);
            const userAnalytics = await adminAnalyticsService.getUserAnalytics(usersQuery);
            return ApiResponseBuilder.success(userAnalytics);

          case "sales":
            const salesQuery = AdminAnalyticsQuerySchema.parse(queryParams);
            const salesAnalytics = await adminAnalyticsService.getSalesAnalytics(salesQuery);
            return ApiResponseBuilder.success(salesAnalytics);

          default:
            // Default: return complete analytics data
            const validatedDefaultQuery = AdminAnalyticsQuerySchema.parse(queryParams);
            const analyticsData = await adminAnalyticsService.getCompleteAnalytics(validatedDefaultQuery);
            return ApiResponseBuilder.success(analyticsData);
        }
      },
    ),
  ),
);