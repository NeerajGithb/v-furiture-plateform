
import { NextRequest } from 'next/server';
import { withSellerAuth, AuthenticatedSeller } from '@/lib/middleware/auth';
import { withDB } from '@/lib/middleware/dbConnection';
import { withRouteErrorHandling } from '@/lib/middleware/errorHandler';
import { ApiResponseBuilder } from '@/lib/utils/apiResponse';
import { SellerReviewsQuerySchema } from '@/lib/domain/seller/reviews/SellerReviewsSchemas';
import { sellerReviewsService } from '@/lib/domain/seller/reviews/SellerReviewsService';

export const GET = withSellerAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, seller: AuthenticatedSeller) => {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get("action");

        switch (action) {
          case "export": {
            // Convert searchParams to object for Zod validation
            const queryParams: Record<string, string> = {};
            searchParams.forEach((value, key) => {
              queryParams[key] = value;
            });

            const validatedQuery = SellerReviewsQuerySchema.parse(queryParams);
            const result = await sellerReviewsService.exportReviews(seller.id, validatedQuery);
            return ApiResponseBuilder.success({ reviews: result }, {
              contentType: 'application/json',
              filename: `reviews-export-${new Date().toISOString().split('T')[0]}.json`
            });
          }

          default: {
            // Convert searchParams to object for Zod validation
            const queryParams: Record<string, string> = {};
            searchParams.forEach((value, key) => {
              queryParams[key] = value;
            });

            // Validate query parameters at route boundary
            const validatedQuery = SellerReviewsQuerySchema.parse(queryParams);

            const result = await sellerReviewsService.getReviews(seller.id, validatedQuery);

            return ApiResponseBuilder.paginated(
              result.data.reviews,
              result.pagination,
              { stats: result.data.stats }
            );
          }
        }
      },
    ),
  ),
);