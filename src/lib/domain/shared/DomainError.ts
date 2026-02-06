export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(message: string, public readonly context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context,
    };
  }
}

// Base validation error
export abstract class ValidationError extends DomainError {
  readonly statusCode = 400;
}

// Base not found error
export abstract class NotFoundError extends DomainError {
  readonly statusCode = 404;
}

// Base duplicate error
export abstract class DuplicateError extends DomainError {
  readonly statusCode = 409;
}

// Base business rule error
export abstract class BusinessRuleError extends DomainError {
  readonly statusCode = 400;
}

// Base unauthorized error
export abstract class UnauthorizedError extends DomainError {
  readonly statusCode = 401;
}