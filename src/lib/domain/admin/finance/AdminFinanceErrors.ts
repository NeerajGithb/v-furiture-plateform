export class AdminFinanceError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.name = 'AdminFinanceError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class PayoutNotFoundError extends AdminFinanceError {
  constructor(payoutId: string) {
    super(`Payout with ID ${payoutId} not found`, 'PAYOUT_NOT_FOUND', 404);
  }
}

export class InsufficientBalanceError extends AdminFinanceError {
  constructor() {
    super('Insufficient balance for payout', 'INSUFFICIENT_BALANCE', 400);
  }
}

export class PayoutAlreadyProcessedError extends AdminFinanceError {
  constructor() {
    super('Payout has already been processed', 'PAYOUT_ALREADY_PROCESSED', 400);
  }
}

export class FinanceDataFetchError extends AdminFinanceError {
  constructor(message: string = 'Failed to fetch finance data') {
    super(message, 'FINANCE_DATA_FETCH_ERROR', 500);
  }
}

export class PayoutCreateError extends AdminFinanceError {
  constructor(message: string = 'Failed to create payout') {
    super(message, 'PAYOUT_CREATE_ERROR', 500);
  }
}

export class PayoutUpdateError extends AdminFinanceError {
  constructor(message: string = 'Failed to update payout') {
    super(message, 'PAYOUT_UPDATE_ERROR', 500);
  }
}

export class RevenueCalculationError extends AdminFinanceError {
  constructor(message: string = 'Failed to calculate revenue') {
    super(message, 'REVENUE_CALCULATION_ERROR', 500);
  }
}