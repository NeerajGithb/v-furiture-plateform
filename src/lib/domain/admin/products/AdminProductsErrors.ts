import { DomainError } from "../../shared/DomainError";

export class ProductNotFoundError extends DomainError {
  readonly code = "PRODUCT_NOT_FOUND";
  readonly statusCode = 404;

  constructor(productId?: string) {
    super(
      productId ? `Product with ID ${productId} not found` : "Product not found",
      { productId }
    );
  }
}

export class ProductValidationError extends DomainError {
  readonly code = "PRODUCT_VALIDATION_ERROR";
  readonly statusCode = 400;

  constructor(field: string, message: string) {
    super(`Validation error for ${field}: ${message}`, { field });
  }
}

export class ProductOperationError extends DomainError {
  readonly code = "PRODUCT_OPERATION_ERROR";
  readonly statusCode = 500;

  constructor(operation: string, message: string) {
    super(`Product operation '${operation}' failed: ${message}`, { operation });
  }
}

export class BulkOperationError extends DomainError {
  readonly code = "BULK_OPERATION_ERROR";
  readonly statusCode = 400;

  constructor(operation: string, failedIds: string[], message: string) {
    super(`Bulk ${operation} failed for ${failedIds.length} products: ${message}`, {
      operation,
      failedIds,
    });
  }
}