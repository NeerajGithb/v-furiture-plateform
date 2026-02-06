import { DomainError } from "../../shared/DomainError";

export class ReviewNotFoundError extends DomainError {
  readonly code = "REVIEW_NOT_FOUND";
  readonly statusCode = 404;

  constructor(reviewId?: string) {
    super(
      reviewId ? `Review with ID ${reviewId} not found` : "Review not found",
      { reviewId }
    );
  }
}

export class ReviewValidationError extends DomainError {
  readonly code = "REVIEW_VALIDATION_ERROR";
  readonly statusCode = 400;

  constructor(field: string, message: string) {
    super(`Validation error for ${field}: ${message}`, { field });
  }
}

export class ReviewOperationError extends DomainError {
  readonly code = "REVIEW_OPERATION_ERROR";
  readonly statusCode = 500;

  constructor(operation: string, message: string) {
    super(`Review operation '${operation}' failed: ${message}`, { operation });
  }
}