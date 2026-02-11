import { NextRequest } from 'next/server';
import { withSellerAuth, AuthenticatedSeller } from '@/lib/middleware/auth';
import { withDB } from '@/lib/middleware/dbConnection';
import { withRouteErrorHandling } from '@/lib/middleware/errorHandler';
import { sellerProductsService } from '@/lib/domain/seller/products/SellerProductsService';
import { UpdateProductSchema } from '@/lib/domain/seller/products/SellerProductsSchemas';
import { ApiResponseBuilder } from '@/lib/utils/apiResponse';

interface RouteParams {
  params: Promise<{
    productId: string;
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
        const { productId } = await params;
        const product = await sellerProductsService.getProductById(productId, seller.id);
        return ApiResponseBuilder.success({ product });
      },
    ),
  ),
);

export const PATCH = withSellerAuth(
  withDB(
    withRouteErrorHandling(
      async (
        request: NextRequest,
        seller: AuthenticatedSeller,
        { params }: RouteParams,
      ) => {
        const { productId } = await params;
        const body = await request.json();
        
        const validatedData = UpdateProductSchema.parse(body);
        const product = await sellerProductsService.updateProduct(productId, seller.id, validatedData);
        
        return ApiResponseBuilder.success({ product }, { message: 'Product updated successfully' });
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
        const { productId } = await params;
        const body = await request.json();
        const { action } = body;

        switch (action) {
          case "updateStatus":
            const { isPublished } = body;
            await sellerProductsService.updateProductStatus(productId, seller.id, isPublished);
            return ApiResponseBuilder.success(
              { isPublished },
              { message: `Product ${isPublished ? 'published' : 'unpublished'} successfully` }
            );

          case "duplicate":
            const product = await sellerProductsService.duplicateProduct(productId, seller.id);
            return ApiResponseBuilder.success({ product }, { message: 'Product duplicated successfully' });

          case "analytics":
            const { period } = body;
            const analytics = await sellerProductsService.getProductAnalytics(productId, seller.id, period);
            return ApiResponseBuilder.success({ analytics });

          case "get_reviews":
            const { page = 1, limit = 10 } = body;
            const reviewsData = await sellerProductsService.getProductReviews(productId, seller.id, page, limit);
            return ApiResponseBuilder.success(reviewsData);

          case "update_inventory":
            const { quantity } = body;
            const result = await sellerProductsService.updateProductInventory(productId, seller.id, quantity);
            return ApiResponseBuilder.success(result);

          default:
            return ApiResponseBuilder.badRequest("Invalid action specified");
        }
      },
    ),
  ),
);

export const DELETE = withSellerAuth(
  withDB(
    withRouteErrorHandling(
      async (
        _request: NextRequest,
        seller: AuthenticatedSeller,
        { params }: RouteParams,
      ) => {
        const { productId } = await params;
        await sellerProductsService.deleteProduct(productId, seller.id);
        return ApiResponseBuilder.success({}, { message: 'Product and all associated images deleted successfully' });
      },
    ),
  ),
);
