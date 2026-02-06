import { NextRequest } from "next/server";
import { withAdminAuth, AuthenticatedAdmin } from "@/lib/middleware/auth";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { adminOrdersService } from "@/lib/domain/admin/orders/AdminOrdersService";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import { OrderStatusUpdateSchema, OrderPaymentUpdateSchema } from "@/lib/domain/admin/orders/AdminOrdersSchemas";

interface RouteParams {
  params: Promise<{
    orderId: string;
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
        const { orderId } = await params;
        const order = await adminOrdersService.getOrderById(orderId);
        return ApiResponseBuilder.success(order);
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
        const { orderId } = await params;
        const body = await request.json();
        const { action } = body;

        switch (action) {
          case "updateOrderStatus":
            const orderStatusData = OrderStatusUpdateSchema.parse({
              orderId,
              ...body,
            });
            const updatedOrder = await adminOrdersService.updateOrderStatus(orderStatusData);
            return ApiResponseBuilder.success(updatedOrder);

          case "updatePaymentStatus":
            const paymentStatusData = OrderPaymentUpdateSchema.parse({
              orderId,
              ...body,
            });
            const updatedPaymentOrder = await adminOrdersService.updatePaymentStatus(paymentStatusData);
            return ApiResponseBuilder.success(updatedPaymentOrder);

          case "addTrackingNumber":
            if (!body.trackingNumber) {
              return ApiResponseBuilder.badRequest("Tracking number is required");
            }
            const trackedOrder = await adminOrdersService.addTrackingNumber(orderId, body.trackingNumber);
            return ApiResponseBuilder.success(trackedOrder);

          case "updateEstimatedDelivery":
            if (!body.estimatedDelivery) {
              return ApiResponseBuilder.badRequest("Estimated delivery date is required");
            }
            const deliveryOrder = await adminOrdersService.updateEstimatedDelivery(
              orderId, 
              new Date(body.estimatedDelivery)
            );
            return ApiResponseBuilder.success(deliveryOrder);

          default:
            return ApiResponseBuilder.badRequest("Invalid action specified");
        }
      },
    ),
  ),
);