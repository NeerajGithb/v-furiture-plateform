export class AdminDashboardError extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.name = 'AdminDashboardError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class DashboardDataFetchError extends AdminDashboardError {
  constructor(section?: string) {
    const message = section ? `Failed to fetch ${section} dashboard data` : 'Failed to fetch dashboard data';
    super(message, 'DASHBOARD_DATA_FETCH_ERROR', 500);
  }
}

export class DashboardStatsError extends AdminDashboardError {
  constructor(message: string = 'Failed to calculate dashboard statistics') {
    super(message, 'DASHBOARD_STATS_ERROR', 500);
  }
}

export class WidgetNotFoundError extends AdminDashboardError {
  constructor(widgetId: string) {
    super(`Widget with ID ${widgetId} not found`, 'WIDGET_NOT_FOUND', 404);
  }
}

export class DashboardLayoutError extends AdminDashboardError {
  constructor(message: string = 'Failed to update dashboard layout') {
    super(message, 'DASHBOARD_LAYOUT_ERROR', 500);
  }
}

export class InvalidPeriodError extends AdminDashboardError {
  constructor(period: string) {
    super(`Invalid period specified: ${period}`, 'INVALID_PERIOD', 400);
  }
}