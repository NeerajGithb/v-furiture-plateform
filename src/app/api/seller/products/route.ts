import { NextRequest } from 'next/server';
import { withSellerAuth, AuthenticatedSeller } from '@/lib/middleware/auth';
import { withDB } from '@/lib/middleware/dbConnection';
import { withRouteErrorHandling } from '@/lib/middleware/errorHandler';
import { sellerProductsService } from '@/lib/domain/seller/products/SellerProductsService';
import { 
  SellerProductsQuerySchema, 
  CreateProductSchema,
  BulkProductUpdateSchema,
  BulkProductDeleteSchema,
  ProductExportSchema
} from '@/lib/domain/seller/products/SellerProductsSchemas';
import { ApiResponseBuilder } from '@/lib/utils/apiResponse';

export const GET = withSellerAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, seller: AuthenticatedSeller) => {
        const { searchParams } = new URL(request.url);
        const queryParams = Object.fromEntries(searchParams.entries());
        
        const validatedQuery = SellerProductsQuerySchema.parse(queryParams);
        const { action, ...filters } = validatedQuery;

        if (queryParams.stats === "true") {
          const stats = await sellerProductsService.getProductStats(seller.id);
          return ApiResponseBuilder.success(stats);
        }

        if (action === 'export') {
          const exportParams = ProductExportSchema.parse(queryParams);
          const exportResult = await sellerProductsService.exportProducts(
            seller.id,
            exportParams.format,
            exportParams.search,
            exportParams.status
          );

          return ApiResponseBuilder.success(exportResult, {
            contentType: exportResult.contentType,
            filename: exportResult.filename
          });
        }

        const result = await sellerProductsService.getProducts({
          sellerId: seller.id,
          ...filters
        });

        return ApiResponseBuilder.paginated(
          result.products,
          result.pagination
        );
      },
    ),
  ),
);

export const POST = withSellerAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, seller: AuthenticatedSeller) => {
        const body = await request.json();

        if (body.action === 'bulk-update') {
          const validatedData = BulkProductUpdateSchema.parse(body);
          const result = await sellerProductsService.bulkUpdateProducts(seller.id, validatedData);
          return ApiResponseBuilder.success(result);
        }

        if (body.action === 'bulk-delete') {
          const validatedData = BulkProductDeleteSchema.parse(body);
          const result = await sellerProductsService.bulkDeleteProducts(seller.id, validatedData.productIds);
          return ApiResponseBuilder.success(result);
        }

        const { _confirmed, ...cleanBody } = body;
        const validatedData = CreateProductSchema.parse(cleanBody);

        const result = await sellerProductsService.createProduct(
          seller.id,
          seller.status,
          validatedData
        );

        return ApiResponseBuilder.success(result, { message: 'Product created successfully' });
      },
    ),
  ),
);
