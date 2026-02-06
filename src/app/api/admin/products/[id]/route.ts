import { NextRequest } from "next/server";
import { withAdminAuth, AuthenticatedAdmin } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { adminProductsService } from "@/lib/domain/admin/products/AdminProductsService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { ProductApprovalSchema } from "@/lib/domain/admin/products/AdminProductsSchemas";

interface RouteParams {
  params: Promise<{
    id: string;
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
        const { id } = await params;
        const product = await adminProductsService.getProductById(id);
        return ApiResponseBuilder.success(product);
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
        const { id } = await params;
        const body = await request.json();
        
        // Validate request body
        const validatedData = ProductApprovalSchema.parse({
          productId: id,
          ...body,
        });

        const product = await adminProductsService.updateProductStatus(validatedData);
        return ApiResponseBuilder.success(product);
      },
    ),
  ),
);

export const POST = withAdminAuth(
  withDB(
    withRouteErrorHandling(
      async (
        request: NextRequest,
        _admin: AuthenticatedAdmin,
        { params }: RouteParams,
      ) => {
        const { id } = await params;
        const body = await request.json();
        const { action } = body;

        switch (action) {
          case "approve":
            const approveData = ProductApprovalSchema.parse({
              productId: id,
              status: "APPROVED",
            });
            const approvedProduct = await adminProductsService.approveProduct(approveData);
            return ApiResponseBuilder.success(approvedProduct);

          case "reject":
            if (!body.reason) {
              return ApiResponseBuilder.badRequest("Rejection reason is required");
            }
            const rejectData = ProductApprovalSchema.parse({
              productId: id,
              status: "REJECTED",
              reason: body.reason,
            });
            const rejectedProduct = await adminProductsService.rejectProduct(rejectData);
            return ApiResponseBuilder.success(rejectedProduct);

          default:
            return ApiResponseBuilder.badRequest("Invalid action specified");
        }
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
        const { id } = await params;
        await adminProductsService.deleteProduct(id);
        return ApiResponseBuilder.noContent();
      },
    ),
  ),
);