import { NotFoundError, BusinessRuleError, ValidationError } from "../../shared/DomainError";

export class OrderNotFoundError extends NotFoundError {
  readonly code = "ORDER_NOT_FOUND";
  constructor(orderId?: string) {
    super(
      orderId ? `Order with ID ${orderId} not found` : "Order not found",
      { orderId }
    );
  }
}

export class OrdersFetchError extends BusinessRuleError {
  readonly code = "ORDERS_FETCH_ERROR";
  constructor(message: string = "Failed to fetch orders") {
    super(message);
  }
}

export class OrderUpdateError extends BusinessRuleError {
  readonly code = "ORDER_UPDATE_ERROR";
  constructor(message: string = "Failed to update order") {
    super(message);
  }
}

export class UnauthorizedOrderAccessError extends BusinessRuleError {
  readonly code = "UNAUTHORIZED_ORDER_ACCESS";
  constructor(message: string = "Unauthorized to access this order") {
    super(message);
  }
}

export class InvalidOrderStatusError extends ValidationError {
  readonly code = "INVALID_ORDER_STATUS";
  constructor(status?: string) {
    super(
      status ? `Invalid order status: ${status}` : "Invalid order status provided"
    );
  }
}

export class BulkOrderUpdateError extends BusinessRuleError {
  readonly code = "BULK_ORDER_UPDATE_ERROR";
  constructor(message: string = "Failed to bulk update orders") {
    super(message);
  }
}

export class OrderExportError extends BusinessRuleError {
  readonly code = "ORDER_EXPORT_ERROR";
  constructor(message: string = "Failed to export orders") {
    super(message);
  }
}