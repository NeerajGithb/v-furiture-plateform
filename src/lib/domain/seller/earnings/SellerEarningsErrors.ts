import { NotFoundError, BusinessRuleError, ValidationError } from "../../shared/DomainError";

export class EarningsDataNotFoundError extends NotFoundError {
  readonly code = "EARNINGS_DATA_NOT_FOUND";
  constructor(message: string = "Earnings data not found") {
    super(message);
  }
}

export class EarningsFetchError extends BusinessRuleError {
  readonly code = "EARNINGS_FETCH_ERROR";
  constructor(message: string = "Failed to fetch earnings data") {
    super(message);
  }
}

export class TransactionNotFoundError extends NotFoundError {
  readonly code = "TRANSACTION_NOT_FOUND";
  constructor(transactionId?: string) {
    super(
      transactionId ? `Transaction with ID ${transactionId} not found` : "Transaction not found",
      { transactionId }
    );
  }
}

export class InsufficientBalanceError extends BusinessRuleError {
  readonly code = "INSUFFICIENT_BALANCE";
  constructor(available: number, requested: number) {
    super(`Insufficient balance. Available: ₹${available}, Requested: ₹${requested}`, { available, requested });
  }
}

export class InvalidPayoutAmountError extends ValidationError {
  readonly code = "INVALID_PAYOUT_AMOUNT";
  constructor() {
    super("Valid payout amount is required");
  }
}

export class PayoutRequestError extends BusinessRuleError {
  readonly code = "PAYOUT_REQUEST_ERROR";
  constructor(message: string = "Failed to request payout") {
    super(message);
  }
}

export class EarningsExportError extends BusinessRuleError {
  readonly code = "EARNINGS_EXPORT_ERROR";
  constructor(message: string = "Failed to export earnings data") {
    super(message);
  }
}