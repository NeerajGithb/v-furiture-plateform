import { NextRequest } from "next/server";
import { withAdminAuth, AuthenticatedAdmin } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { adminOrdersService } from "@/lib/domain/admin/orders/AdminOrdersService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { AdminOrdersQuerySchema, OrderStatsQuerySchema, OrderExportSchema } from "@/lib/domain/admin/orders/AdminOrdersSchemas";

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
          const validatedQuery = OrderStatsQuerySchema.parse(queryParams);
          const stats = await adminOrdersService.getOrderStats(validatedQuery);
          return ApiResponseBuilder.success(stats);
        }

        // Default: get orders list
        const validatedQuery = AdminOrdersQuerySchema.parse(queryParams);
        const result = await adminOrdersService.getOrders(validatedQuery);

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
          const validatedRequest = OrderExportSchema.parse(body);
          const orders = await adminOrdersService.exportOrders(validatedRequest);
          
          return ApiResponseBuilder.success({
            orders,
            format: validatedRequest.format,
            count: orders.length,
            exportedAt: new Date().toISOString(),
          });
        }

        return ApiResponseBuilder.badRequest("Invalid action specified");
      },
    ),
  ),
);
