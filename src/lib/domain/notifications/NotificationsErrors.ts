import { NotFoundError, BusinessRuleError } from "../shared/DomainError";

export class NotificationNotFoundError extends NotFoundError {
  readonly code = "NOTIFICATION_NOT_FOUND";
  constructor(id?: string) {
    super("Notification not found", { id });
  }
}

export class InvalidNotificationActionError extends BusinessRuleError {
  readonly code = "INVALID_NOTIFICATION_ACTION";
  constructor(action?: string) {
    super("Invalid notification action", { action });
  }
}

export class InvalidRecipientError extends BusinessRuleError {
  readonly code = "INVALID_RECIPIENT";
  constructor() {
    super("Either sellerId or userId is required");
  }
}

export class NotificationCreateError extends BusinessRuleError {
  readonly code = "NOTIFICATION_CREATE_ERROR";
  constructor(message: string = "Failed to create notification") {
    super(message);
  }
}

export class NotificationUpdateError extends BusinessRuleError {
  readonly code = "NOTIFICATION_UPDATE_ERROR";
  constructor(message: string = "Failed to update notification") {
    super(message);
  }
}