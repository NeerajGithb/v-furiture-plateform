import { NextRequest } from "next/server";
import { withAdminAuth, AuthenticatedAdmin } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { adminReviewsService } from "@/lib/domain/admin/reviews/AdminReviewsService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { AdminReviewsQuerySchema, ReviewStatsQuerySchema, ReviewExportSchema } from "@/lib/domain/admin/reviews/AdminReviewsSchemas";

export const GET = withAdminAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, _admin: AuthenticatedAdmin) => {
        const { searchParams } = new URL(request.url);
        const queryParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          queryParams[key] = value;
        });

        // Check if this is a stats request
        if (queryParams.stats === "true") {
          const validatedQuery = ReviewStatsQuerySchema.parse(queryParams);
          const stats = await adminReviewsService.getReviewStats(validatedQuery);
          return ApiResponseBuilder.success({ stats });
        }

        // Default: get reviews list
        const validatedQuery = AdminReviewsQuerySchema.parse(queryParams);
        const result = await adminReviewsService.getReviews(validatedQuery);

        return ApiResponseBuilder.paginated(
          result.data,
          result.pagination
        );
      },
    ),
  ),
);

export const POST = withAdminAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, _admin: AuthenticatedAdmin) => {
        const body = await request.json();
        const { action } = body;

        if (action === "export") {
          const validatedRequest = ReviewExportSchema.parse(body);
          const reviews = await adminReviewsService.exportReviews(validatedRequest);

          return ApiResponseBuilder.success({
            reviews,
            count: reviews.length,
            exportedAt: new Date().toISOString(),
          });
        }

        return ApiResponseBuilder.badRequest("Invalid action specified");
      },
    ),
  ),
);
