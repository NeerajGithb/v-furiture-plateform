import { NotFoundError, BusinessRuleError } from "../../shared/DomainError";

export class SellerNotFoundError extends NotFoundError {
  readonly code = "SELLER_NOT_FOUND";
  constructor(sellerId?: string) {
    super(
      sellerId ? `Seller with ID ${sellerId} not found` : "Seller not found",
      { sellerId }
    );
  }
}

export class ProfileFetchError extends BusinessRuleError {
  readonly code = "PROFILE_FETCH_ERROR";
  constructor(message: string = "Failed to fetch profile") {
    super(message);
  }
}

export class ProfileUpdateError extends BusinessRuleError {
  readonly code = "PROFILE_UPDATE_ERROR";
  constructor(message: string = "Failed to update profile") {
    super(message);
  }
}

export class PasswordChangeError extends BusinessRuleError {
  readonly code = "PASSWORD_CHANGE_ERROR";
  constructor(message: string = "Failed to change password") {
    super(message);
  }
}

export class InvalidPasswordError extends BusinessRuleError {
  readonly code = "INVALID_PASSWORD";
  constructor(message: string = "Current password is incorrect") {
    super(message);
  }
}

export class DocumentUploadError extends BusinessRuleError {
  readonly code = "DOCUMENT_UPLOAD_ERROR";
  constructor(message: string = "Failed to upload document") {
    super(message);
  }
}

export class VerificationRequestError extends BusinessRuleError {
  readonly code = "VERIFICATION_REQUEST_ERROR";
  constructor(message: string = "Failed to submit verification request") {
    super(message);
  }
}

export class AlreadyVerifiedError extends BusinessRuleError {
  readonly code = "ALREADY_VERIFIED";
  constructor() {
    super("Account is already verified");
  }
}

export class VerificationPendingError extends BusinessRuleError {
  readonly code = "VERIFICATION_PENDING";
  constructor() {
    super("Verification request is already pending");
  }
}

export class ProfileStatsError extends BusinessRuleError {
  readonly code = "PROFILE_STATS_ERROR";
  constructor(message: string = "Failed to fetch profile statistics") {
    super(message);
  }
}