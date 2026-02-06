import { NextRequest } from 'next/server';
import { withSellerAuth, AuthenticatedSeller } from '@/lib/middleware/auth';
import { withDB } from '@/lib/middleware/dbConnection';
import { withRouteErrorHandling } from '@/lib/middleware/errorHandler';
import { sellerReviewsService } from '@/lib/domain/seller/reviews/SellerReviewsService';
import { ApiResponseBuilder } from '@/lib/utils/apiResponse';
import { RespondToReviewSchema, ReportReviewSchema } from '@/lib/domain/seller/reviews/SellerReviewsSchemas';

interface RouteParams {
  params: Promise<{
    reviewId: string;
  }>;
}

export const GET = withSellerAuth(
  withDB(
    withRouteErrorHandling(
      async (
        _request: NextRequest,
        seller: AuthenticatedSeller,
        { params }: RouteParams,
      ) => {
        const { reviewId } = await params;
        const result = await sellerReviewsService.getReviewById(reviewId, seller.id);

        if (!result) {
          return ApiResponseBuilder.notFound("Review not found");
        }

        return ApiResponseBuilder.success({ review: result });
      },
    ),
  ),
);

export const POST = withSellerAuth(
  withDB(
    withRouteErrorHandling(
      async (
        request: NextRequest,
        seller: AuthenticatedSeller,
        { params }: RouteParams,
      ) => {
        const { reviewId } = await params;
        const body = await request.json();
        const { action } = body;

        switch (action) {
          case "respond":
            const respondData = RespondToReviewSchema.parse(body);
            const result = await sellerReviewsService.respondToReview(reviewId, seller.id, respondData);
            return ApiResponseBuilder.success({ review: result });

          case "report":
            const reportData = ReportReviewSchema.parse(body);
            await sellerReviewsService.reportReview(reviewId, seller.id, reportData);
            return ApiResponseBuilder.success({}, { message: "Review reported successfully" });

          default:
            return ApiResponseBuilder.badRequest("Invalid action specified");
        }
      },
    ),
  ),
);