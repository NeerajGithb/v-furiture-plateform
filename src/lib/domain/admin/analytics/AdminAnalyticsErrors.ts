export class AdminAnalyticsError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.name = 'AdminAnalyticsError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class AnalyticsDataFetchError extends AdminAnalyticsError {
  constructor(message: string = 'Failed to fetch analytics data') {
    super(message, 'ANALYTICS_DATA_FETCH_ERROR', 500);
  }
}

export class InvalidDateRangeError extends AdminAnalyticsError {
  constructor() {
    super('Invalid date range provided', 'INVALID_DATE_RANGE', 400);
  }
}

export class AnalyticsExportError extends AdminAnalyticsError {
  constructor(message: string = 'Failed to export analytics data') {
    super(message, 'ANALYTICS_EXPORT_ERROR', 500);
  }
}

export class MetricsCalculationError extends AdminAnalyticsError {
  constructor(metric: string) {
    super(`Failed to calculate ${metric} metrics`, 'METRICS_CALCULATION_ERROR', 500);
  }
}