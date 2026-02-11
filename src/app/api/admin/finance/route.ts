import { NextRequest } from "next/server";
import { withAdminAuth, AuthenticatedAdmin } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { adminFinanceService } from "@/lib/domain/admin/finance/AdminFinanceService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { 
  FinanceQuerySchema, 
  PayoutQuerySchema, 
  PayoutCreateSchema 
} from "@/lib/domain/admin/finance/AdminFinanceSchemas";

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

        // Check what type of data is requested
        if (queryParams.type === "overview") {
          const validatedQuery = FinanceQuerySchema.parse(queryParams);
          const overview = await adminFinanceService.getFinanceOverview(validatedQuery);
          return ApiResponseBuilder.success(overview);
        }

        if (queryParams.type === "data") {
          const validatedQuery = FinanceQuerySchema.parse(queryParams);
          const data = await adminFinanceService.getFinanceData(validatedQuery);
          return ApiResponseBuilder.success(data);
        }

        if (queryParams.type === "export") {
          const validatedQuery = FinanceQuerySchema.parse(queryParams);
          const overview = await adminFinanceService.getFinanceOverview(validatedQuery);
          return ApiResponseBuilder.success({
            data: overview,
            format: queryParams.format || 'json',
            exportedAt: new Date().toISOString(),
          });
        }

        if (queryParams.type === "revenue") {
          const validatedQuery = FinanceQuerySchema.parse(queryParams);
          const revenueData = await adminFinanceService.getRevenueData(validatedQuery);
          return ApiResponseBuilder.success(revenueData);
        }

        if (queryParams.type === "payouts") {
          const validatedQuery = PayoutQuerySchema.parse(queryParams);
          const result = await adminFinanceService.getPayouts(validatedQuery);
          return ApiResponseBuilder.paginated(result.data, result.pagination);
        }

        if (queryParams.type === "payout-stats") {
          const stats = await adminFinanceService.getPayoutStats();
          return ApiResponseBuilder.success(stats);
        }

        if (queryParams.type === "top-sellers") {
          const limit = queryParams.limit ? parseInt(queryParams.limit) : 10;
          const topSellers = await adminFinanceService.getTopSellersByRevenue(limit);
          return ApiResponseBuilder.success(topSellers);
        }

        if (queryParams.type === "revenue-by-category") {
          const categoryRevenue = await adminFinanceService.getRevenueByCategory();
          return ApiResponseBuilder.success(categoryRevenue);
        }

        // Default: return full finance data
        const validatedQuery = FinanceQuerySchema.parse(queryParams);
        const data = await adminFinanceService.getFinanceData(validatedQuery);
        return ApiResponseBuilder.success(data);
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

        if (action === "create-payout") {
          const validatedData = PayoutCreateSchema.parse(body);
          const payout = await adminFinanceService.createPayout(validatedData);
          return ApiResponseBuilder.created(payout);
        }

        return ApiResponseBuilder.badRequest("Invalid action specified");
      },
    ),
  ),
);