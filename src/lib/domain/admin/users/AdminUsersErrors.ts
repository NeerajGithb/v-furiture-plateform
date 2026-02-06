import { DomainError } from "../../shared/DomainError";

export class UserNotFoundError extends DomainError {
  readonly code = "USER_NOT_FOUND";
  readonly statusCode = 404;

  constructor(userId?: string) {
    super(
      userId ? `User with ID ${userId} not found` : "User not found",
      { userId }
    );
  }
}

export class UserValidationError extends DomainError {
  readonly code = "USER_VALIDATION_ERROR";
  readonly statusCode = 400;

  constructor(field: string, message: string) {
    super(`Validation error for ${field}: ${message}`, { field });
  }
}

export class UserOperationError extends DomainError {
  readonly code = "USER_OPERATION_ERROR";
  readonly statusCode = 500;

  constructor(operation: string, message: string) {
    super(`User operation '${operation}' failed: ${message}`, { operation });
  }
}

export class UserStatusError extends DomainError {
  readonly code = "USER_STATUS_ERROR";
  readonly statusCode = 400;

  constructor(currentStatus: string, targetStatus: string) {
    super(`Cannot change user status from ${currentStatus} to ${targetStatus}`, {
      currentStatus,
      targetStatus,
    });
  }
}