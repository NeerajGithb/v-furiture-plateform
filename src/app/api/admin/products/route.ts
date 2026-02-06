import { NextRequest } from "next/server";
import { withAdminAuth, AuthenticatedAdmin } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { adminProductsService } from "@/lib/domain/admin/products/AdminProductsService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { 
  AdminProductsQuerySchema, 
  ProductStatsQuerySchema,
  BulkProductApprovalSchema, 
  BulkProductPublishSchema, 
  BulkProductDeleteSchema 
} from "@/lib/domain/admin/products/AdminProductsSchemas";

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

        // Check if this is a stats request
        if (queryParams.stats === "true") {
          const validatedQuery = ProductStatsQuerySchema.parse(queryParams);
          const stats = await adminProductsService.getProductStats(validatedQuery);
          return ApiResponseBuilder.success(stats);
        }

        // Default: get products list
        const validatedQuery = AdminProductsQuerySchema.parse(queryParams);
        const result = await adminProductsService.getProducts(validatedQuery);

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

        // Handle bulk operations
        switch (action) {
          case "approve":
            const approveData = BulkProductApprovalSchema.parse({
              ...body,
              status: "APPROVED",
            });
            const approveResult = await adminProductsService.bulkApproveProducts(approveData);
            return ApiResponseBuilder.success(approveResult);

          case "reject":
            const rejectData = BulkProductApprovalSchema.parse({
              ...body,
              status: "REJECTED",
            });
            const rejectResult = await adminProductsService.bulkRejectProducts(rejectData);
            return ApiResponseBuilder.success(rejectResult);

          case "updateStatus":
            const statusData = BulkProductApprovalSchema.parse(body);
            const statusResult = await adminProductsService.bulkUpdateProductStatus(statusData);
            return ApiResponseBuilder.success(statusResult);

          case "publish":
            const publishData = BulkProductPublishSchema.parse(body);
            const publishResult = await adminProductsService.bulkToggleProductPublish(publishData);
            return ApiResponseBuilder.success(publishResult);

          case "delete":
            const deleteData = BulkProductDeleteSchema.parse(body);
            const deleteResult = await adminProductsService.bulkDeleteProducts(deleteData);
            return ApiResponseBuilder.success(deleteResult);

          default:
            return ApiResponseBuilder.badRequest("Invalid action specified");
        }
      },
    ),
  ),
);

