import { NextRequest } from "next/server";
import { withAdminAuth, AuthenticatedAdmin } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { adminReviewsService } from "@/lib/domain/admin/reviews/AdminReviewsService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { ReviewStatusUpdateSchema } from "@/lib/domain/admin/reviews/AdminReviewsSchemas";

interface RouteParams {
  params: Promise<{
    reviewId: string;
  }>;
}

export const GET = withAdminAuth(
  withDB(
    withRouteErrorHandling(
      async (
        _request: NextRequest,
        _admin: AuthenticatedAdmin,
        { params }: RouteParams,
      ) => {
        const { reviewId } = await params;
        const review = await adminReviewsService.getReviewById(reviewId);
        return ApiResponseBuilder.success({ review });
      },
    ),
  ),
);

export const PATCH = withAdminAuth(
  withDB(
    withRouteErrorHandling(
      async (
        request: NextRequest,
        _admin: AuthenticatedAdmin,
        { params }: RouteParams,
      ) => {
        const { reviewId } = await params;
        const body = await request.json();
        const { action, status, reason } = body;

        if (action === "updateStatus") {
          // Validate status
          if (!['approved', 'rejected'].includes(status)) {
            return ApiResponseBuilder.badRequest('Invalid status. Must be "approved" or "rejected"');
          }

          const validatedData = ReviewStatusUpdateSchema.parse({
            reviewId,
            status,
            reason,
          });

          const review = await adminReviewsService.updateReviewStatus(validatedData);
          return ApiResponseBuilder.success({ 
            review
          }, { message: `Review ${status} successfully` });
        }

        return ApiResponseBuilder.badRequest("Invalid action specified");
      },
    ),
  ),
);

export const DELETE = withAdminAuth(
  withDB(
    withRouteErrorHandling(
      async (
        _request: NextRequest,
        _admin: AuthenticatedAdmin,
        { params }: RouteParams,
      ) => {
        const { reviewId } = await params;
        await adminReviewsService.deleteReview(reviewId);
        return ApiResponseBuilder.success({}, { message: 'Review deleted successfully' });
      },
    ),
  ),
);