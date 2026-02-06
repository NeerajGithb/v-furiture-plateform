import {
  NotFoundError,
  BusinessRuleError,
  UnauthorizedError,
} from "../shared/DomainError";

export class SellerNotFoundError extends NotFoundError {
  readonly code = "SELLER_NOT_FOUND";
  constructor(email?: string) {
    super("No seller account exists with this email. Please sign up first.", {
      email,
    });
  }
}

export class AdminNotFoundError extends NotFoundError {
  readonly code = "ADMIN_NOT_FOUND";
  constructor(email?: string) {
    super("No admin account exists with this email.", {
      email,
    });
  }
}

export class EmailAlreadyExistsError extends BusinessRuleError {
  readonly code = "EMAIL_ALREADY_EXISTS";
  constructor(email: string) {
    super("Email already exists. Try logging in instead.", { email });
  }
}

export class InvalidCredentialsError extends UnauthorizedError {
  readonly code = "INVALID_CREDENTIALS";
  constructor(remainingAttempts?: number) {
    super("The password you entered is incorrect. Please try again.", {
      remainingAttempts,
    });
  }
}

export class AccountSuspendedError extends BusinessRuleError {
  readonly code = "ACCOUNT_SUSPENDED";
  constructor() {
    super("Account is suspended. Please contact support.");
  }
}

export class AccountInactiveError extends BusinessRuleError {
  readonly code = "ACCOUNT_INACTIVE";
  constructor() {
    super("Account is inactive. Please contact support.");
  }
}

export class AccountPendingError extends BusinessRuleError {
  readonly code = "ACCOUNT_PENDING";
  constructor() {
    super("Account is pending approval. Please wait for admin approval.");
  }
}

export class AccountLockedError extends BusinessRuleError {
  readonly code = "ACCOUNT_LOCKED";
  constructor(remainingMinutes: number) {
    super(
      `Account is locked due to too many failed login attempts. Try again in ${remainingMinutes} minutes.`,
      { remainingMinutes },
    );
  }
}

export class RateLimitExceededError extends BusinessRuleError {
  readonly code = "RATE_LIMIT_EXCEEDED";
  constructor(message: string) {
    super(message);
  }
}

export class InvalidResetCodeError extends BusinessRuleError {
  readonly code = "INVALID_RESET_CODE";
  constructor() {
    super("Invalid or expired reset code");
  }
}

export class WeakPasswordError extends BusinessRuleError {
  readonly code = "WEAK_PASSWORD";
  constructor(errors: string[]) {
    super("Password does not meet requirements", { errors });
  }
}

export class InvalidTokenError extends UnauthorizedError {
  readonly code = "INVALID_TOKEN";
  constructor(message: string = "Invalid or expired token") {
    super(message);
  }
}

export class MissingTokenError extends UnauthorizedError {
  readonly code = "MISSING_TOKEN";
  constructor(message: string = "Access token missing") {
    super(message);
  }
}

export class UnauthorizedRoleError extends UnauthorizedError {
  readonly code = "UNAUTHORIZED_ROLE";
  constructor(requiredRole: string) {
    super(`Access denied. Required role: ${requiredRole}`);
  }
}