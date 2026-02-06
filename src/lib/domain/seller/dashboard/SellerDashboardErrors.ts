import { NotFoundError, BusinessRuleError } from "../../shared/DomainError";

export class DashboardDataNotFoundError extends NotFoundError {
  readonly code = "DASHBOARD_DATA_NOT_FOUND";
  constructor(message: string = "Dashboard data not found") {
    super(message);
  }
}

export class DashboardFetchError extends BusinessRuleError {
  readonly code = "DASHBOARD_FETCH_ERROR";
  constructor(message: string = "Failed to fetch dashboard data") {
    super(message);
  }
}

export class EarningsDataError extends BusinessRuleError {
  readonly code = "EARNINGS_DATA_ERROR";
  constructor(message: string = "Failed to fetch earnings data") {
    super(message);
  }
}

export class OrderStatsError extends BusinessRuleError {
  readonly code = "ORDER_STATS_ERROR";
  constructor(message: string = "Failed to fetch order statistics") {
    super(message);
  }
}

export class ProductStatsError extends BusinessRuleError {
  readonly code = "PRODUCT_STATS_ERROR";
  constructor(message: string = "Failed to fetch product statistics") {
    super(message);
  }
}

export class ReviewStatsError extends BusinessRuleError {
  readonly code = "REVIEW_STATS_ERROR";
  constructor(message: string = "Failed to fetch review statistics") {
    super(message);
  }
}