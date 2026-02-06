import { DomainError } from "../../shared/DomainError";

export class OrderNotFoundError extends DomainError {
  readonly code = "ORDER_NOT_FOUND";
  readonly statusCode = 404;

  constructor(orderId?: string) {
    super(
      orderId ? `Order with ID ${orderId} not found` : "Order not found",
      { orderId }
    );
  }
}

export class OrderValidationError extends DomainError {
  readonly code = "ORDER_VALIDATION_ERROR";
  readonly statusCode = 400;

  constructor(field: string, message: string) {
    super(`Validation error for ${field}: ${message}`, { field });
  }
}

export class OrderOperationError extends DomainError {
  readonly code = "ORDER_OPERATION_ERROR";
  readonly statusCode = 500;

  constructor(operation: string, message: string) {
    super(`Order operation '${operation}' failed: ${message}`, { operation });
  }
}

export class OrderStatusError extends DomainError {
  readonly code = "ORDER_STATUS_ERROR";
  readonly statusCode = 400;

  constructor(currentStatus: string, targetStatus: string) {
    super(`Cannot change order status from ${currentStatus} to ${targetStatus}`, {
      currentStatus,
      targetStatus,
    });
  }
}