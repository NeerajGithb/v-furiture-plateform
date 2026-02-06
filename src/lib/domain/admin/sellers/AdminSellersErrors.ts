import { DomainError } from "../../shared/DomainError";

export class SellerNotFoundError extends DomainError {
  readonly code = "SELLER_NOT_FOUND";
  readonly statusCode = 404;

  constructor(sellerId?: string) {
    super(
      sellerId ? `Seller with ID ${sellerId} not found` : "Seller not found",
      { sellerId }
    );
  }
}

export class SellerValidationError extends DomainError {
  readonly code = "SELLER_VALIDATION_ERROR";
  readonly statusCode = 400;

  constructor(field: string, message: string) {
    super(`Validation error for ${field}: ${message}`, { field });
  }
}

export class SellerOperationError extends DomainError {
  readonly code = "SELLER_OPERATION_ERROR";
  readonly statusCode = 500;

  constructor(operation: string, message: string) {
    super(`Seller operation '${operation}' failed: ${message}`, { operation });
  }
}

export class SellerStatusError extends DomainError {
  readonly code = "SELLER_STATUS_ERROR";
  readonly statusCode = 400;

  constructor(currentStatus: string, targetStatus: string) {
    super(`Cannot change seller status from ${currentStatus} to ${targetStatus}`, {
      currentStatus,
      targetStatus,
    });
  }
}