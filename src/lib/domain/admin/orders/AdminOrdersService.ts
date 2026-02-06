import { IAdminOrdersRepository, AdminOrder, OrderStats, OrderTrend } from "./IAdminOrdersRepository";
import { AdminOrdersRepository } from "./AdminOrdersRepository";
import { 
  AdminOrdersQueryRequest,
  OrderStatusUpdateRequest,
  OrderPaymentUpdateRequest,
  OrderStatsQueryRequest,
  OrderExportRequest
} from "./AdminOrdersSchemas";
import {
  OrderNotFoundError,
  OrderValidationError,
  OrderOperationError,
  OrderStatusError,
} from "./AdminOrdersErrors";
import { PaginationResult } from "../../shared/types";

export class AdminOrdersService {
  constructor(
    private repository: IAdminOrdersRepository = new AdminOrdersRepository(),
  ) {}

  // Order queries
  async getOrders(query: AdminOrdersQueryRequest): Promise<PaginationResult<AdminOrder>> {
    try {
      return await this.repository.findMany(query);
    } catch (error) {
      throw new OrderOperationError("getOrders", (error as Error).message);
    }
  }

  async getOrderById(id: string): Promise<AdminOrder> {
    try {
      const order = await this.repository.findById(id);
      if (!order) {
        throw new OrderNotFoundError(id);
      }
      return order;
    } catch (error) {
      if (error instanceof OrderNotFoundError) {
        throw error;
      }
      throw new OrderOperationError("getOrderById", (error as Error).message);
    }
  }

  async getOrderByNumber(orderNumber: string): Promise<AdminOrder> {
    try {
      const order = await this.repository.findByOrderNumber(orderNumber);
      if (!order) {
        throw new OrderNotFoundError(orderNumber);
      }
      return order;
    } catch (error) {
      if (error instanceof OrderNotFoundError) {
        throw error;
      }
      throw new OrderOperationError("getOrderByNumber", (error as Error).message);
    }
  }

  async getOrderStats(query: OrderStatsQueryRequest): Promise<OrderStats> {
    try {
      return await this.repository.getStats(query.period);
    } catch (error) {
      throw new OrderOperationError("getOrderStats", (error as Error).message);
    }
  }

  async getOrderTrends(startDate: Date, endDate: Date, groupBy: string): Promise<OrderTrend[]> {
    try {
      return await this.repository.getTrends(startDate, endDate, groupBy);
    } catch (error) {
      throw new OrderOperationError("getOrderTrends", (error as Error).message);
    }
  }

  // Order management
  async updateOrderStatus(request: OrderStatusUpdateRequest): Promise<AdminOrder> {
    try {
      const order = await this.repository.findById(request.orderId);
      if (!order) {
        throw new OrderNotFoundError(request.orderId);
      }

      // Validate status transition
      this.validateStatusTransition(order.orderStatus, request.orderStatus);

      return await this.repository.updateOrderStatus(
        request.orderId, 
        request.orderStatus, 
        request.notes
      );
    } catch (error) {
      if (error instanceof OrderNotFoundError || error instanceof OrderStatusError) {
        throw error;
      }
      throw new OrderOperationError("updateOrderStatus", (error as Error).message);
    }
  }

  async updatePaymentStatus(request: OrderPaymentUpdateRequest): Promise<AdminOrder> {
    try {
      const order = await this.repository.findById(request.orderId);
      if (!order) {
        throw new OrderNotFoundError(request.orderId);
      }

      // Validate payment status transition
      this.validatePaymentStatusTransition(order.paymentStatus, request.paymentStatus);

      return await this.repository.updatePaymentStatus(
        request.orderId, 
        request.paymentStatus, 
        request.notes
      );
    } catch (error) {
      if (error instanceof OrderNotFoundError || error instanceof OrderStatusError) {
        throw error;
      }
      throw new OrderOperationError("updatePaymentStatus", (error as Error).message);
    }
  }

  async addTrackingNumber(orderId: string, trackingNumber: string): Promise<AdminOrder> {
    try {
      const order = await this.repository.findById(orderId);
      if (!order) {
        throw new OrderNotFoundError(orderId);
      }

      if (!trackingNumber.trim()) {
        throw new OrderValidationError("trackingNumber", "Tracking number cannot be empty");
      }

      return await this.repository.addTrackingNumber(orderId, trackingNumber);
    } catch (error) {
      if (error instanceof OrderNotFoundError || error instanceof OrderValidationError) {
        throw error;
      }
      throw new OrderOperationError("addTrackingNumber", (error as Error).message);
    }
  }

  async updateEstimatedDelivery(orderId: string, estimatedDelivery: Date): Promise<AdminOrder> {
    try {
      const order = await this.repository.findById(orderId);
      if (!order) {
        throw new OrderNotFoundError(orderId);
      }

      if (estimatedDelivery < new Date()) {
        throw new OrderValidationError("estimatedDelivery", "Estimated delivery cannot be in the past");
      }

      return await this.repository.updateEstimatedDelivery(orderId, estimatedDelivery);
    } catch (error) {
      if (error instanceof OrderNotFoundError || error instanceof OrderValidationError) {
        throw error;
      }
      throw new OrderOperationError("updateEstimatedDelivery", (error as Error).message);
    }
  }

  // Export
  async exportOrders(request: OrderExportRequest): Promise<AdminOrder[]> {
    try {
      const query: AdminOrdersQueryRequest = {
        page: "1",
        limit: "10000", // Large limit for export
        startDate: request.startDate,
        endDate: request.endDate,
        orderStatus: request.orderStatus,
        paymentStatus: request.paymentStatus,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      return await this.repository.exportOrders(query);
    } catch (error) {
      throw new OrderOperationError("exportOrders", (error as Error).message);
    }
  }

  // Private validation methods
  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: Record<string, string[]> = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered", "returned"],
      delivered: ["returned"],
      cancelled: [], // Cannot transition from cancelled
      returned: [], // Cannot transition from returned
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new OrderStatusError(currentStatus, newStatus);
    }
  }

  private validatePaymentStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: Record<string, string[]> = {
      pending: ["paid", "failed"],
      paid: ["refunded"],
      failed: ["paid"],
      refunded: [], // Cannot transition from refunded
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new OrderStatusError(currentStatus, newStatus);
    }
  }
}

// Export singleton instance
export const adminOrdersService = new AdminOrdersService();