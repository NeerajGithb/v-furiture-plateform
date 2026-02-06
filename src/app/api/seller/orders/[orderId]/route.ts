import { NextRequest } from "next/server";
import { withSellerAuth, AuthenticatedSeller } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { sellerOrdersService } from "@/lib/domain/seller/orders/SellerOrdersService";
import { 
  OrderStatusUpdateSchema,
  OrderTrackingUpdateSchema,
  OrderNotesSchema,
  OrderCancelSchema
} from "@/lib/domain/seller/orders/SellerOrdersSchemas";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";

interface RouteParams {
  params: Promise<{
    orderId: string;
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
        const { orderId } = await params;
        const result = await sellerOrdersService.getOrderById(seller.id, orderId);
        return ApiResponseBuilder.success({ order: result });
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
        const { orderId } = await params;
        const body = await request.json();
        const { action } = body;

        switch (action) {
          case "updateStatus":
            const statusData = OrderStatusUpdateSchema.parse(body);
            await sellerOrdersService.updateOrderStatus(seller.id, orderId, statusData);
            return ApiResponseBuilder.success({}, { message: "Order status updated successfully" });

          case "updateTracking":
            const trackingData = OrderTrackingUpdateSchema.parse(body);
            await sellerOrdersService.updateOrderTracking(seller.id, orderId, trackingData);
            return ApiResponseBuilder.success({}, { message: "Tracking information updated successfully" });

          case "addNotes":
            const notesData = OrderNotesSchema.parse(body);
            await sellerOrdersService.addOrderNotes(seller.id, orderId, notesData);
            return ApiResponseBuilder.success({}, { message: "Notes added successfully" });

          case "cancel":
            const cancelData = OrderCancelSchema.parse(body);
            await sellerOrdersService.cancelOrder(seller.id, orderId, cancelData);
            return ApiResponseBuilder.success({}, { message: "Order cancelled successfully" });

          default:
            return ApiResponseBuilder.badRequest("Invalid action specified");
        }
      },
    ),
  ),
);