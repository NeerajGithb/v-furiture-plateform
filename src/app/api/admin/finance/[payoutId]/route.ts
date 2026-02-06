import { NextRequest } from "next/server";
import { withAdminAuth, AuthenticatedAdmin } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { adminFinanceService } from "@/lib/domain/admin/finance/AdminFinanceService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { PayoutUpdateSchema } from "@/lib/domain/admin/finance/AdminFinanceSchemas";

interface RouteParams {
  params: Promise<{
    payoutId: string;
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
        const { payoutId } = await params;
        const payout = await adminFinanceService.getPayoutById(payoutId);
        return ApiResponseBuilder.success(payout);
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
        const { payoutId } = await params;
        const body = await request.json();
        const { action } = body;

        switch (action) {
          case "update":
            const validatedData = PayoutUpdateSchema.parse(body);
            const updatedPayout = await adminFinanceService.updatePayout(payoutId, validatedData);
            return ApiResponseBuilder.success(updatedPayout);

          case "approve":
            const approvedPayout = await adminFinanceService.approvePayout(payoutId);
            return ApiResponseBuilder.success(approvedPayout);

          case "reject":
            if (!body.reason) {
              return ApiResponseBuilder.badRequest("Rejection reason is required");
            }
            const rejectedPayout = await adminFinanceService.rejectPayout(payoutId, body.reason);
            return ApiResponseBuilder.success(rejectedPayout);

          default:
            return ApiResponseBuilder.badRequest("Invalid action specified");
        }
      },
    ),
  ),
);