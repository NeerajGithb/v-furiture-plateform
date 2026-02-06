import { NotFoundError, BusinessRuleError, ValidationError } from "../../shared/DomainError";

export class NotificationNotFoundError extends NotFoundError {
  readonly code = "NOTIFICATION_NOT_FOUND";
  constructor(notificationId?: string) {
    super(
      notificationId ? `Notification with ID ${notificationId} not found` : "Notification not found",
      { notificationId }
    );
  }
}

export class NotificationsFetchError extends BusinessRuleError {
  readonly code = "NOTIFICATIONS_FETCH_ERROR";
  constructor(message: string = "Failed to fetch notifications") {
    super(message);
  }
}

export class NotificationUpdateError extends BusinessRuleError {
  readonly code = "NOTIFICATION_UPDATE_ERROR";
  constructor(message: string = "Failed to update notification") {
    super(message);
  }
}

export class NotificationDeleteError extends BusinessRuleError {
  readonly code = "NOTIFICATION_DELETE_ERROR";
  constructor(message: string = "Failed to delete notification") {
    super(message);
  }
}

export class InvalidNotificationIdsError extends ValidationError {
  readonly code = "INVALID_NOTIFICATION_IDS";
  constructor() {
    super("Invalid notification IDs provided");
  }
}

export class NotificationCacheError extends BusinessRuleError {
  readonly code = "NOTIFICATION_CACHE_ERROR";
  constructor(message: string = "Failed to invalidate notification cache") {
    super(message);
  }
}