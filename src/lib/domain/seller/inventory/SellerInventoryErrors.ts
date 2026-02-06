import { NotFoundError, BusinessRuleError, ValidationError } from "../../shared/DomainError";

export class InventoryItemNotFoundError extends NotFoundError {
  readonly code = "INVENTORY_ITEM_NOT_FOUND";
  constructor(productId?: string) {
    super(
      productId ? `Inventory item with product ID ${productId} not found` : "Inventory item not found",
      { productId }
    );
  }
}

export class InventoryFetchError extends BusinessRuleError {
  readonly code = "INVENTORY_FETCH_ERROR";
  constructor(message: string = "Failed to fetch inventory data") {
    super(message);
  }
}

export class InventoryUpdateError extends BusinessRuleError {
  readonly code = "INVENTORY_UPDATE_ERROR";
  constructor(message: string = "Failed to update inventory") {
    super(message);
  }
}

export class InvalidStockQuantityError extends ValidationError {
  readonly code = "INVALID_STOCK_QUANTITY";
  constructor() {
    super("Stock quantity must be a non-negative number");
  }
}

export class InvalidReorderLevelError extends ValidationError {
  readonly code = "INVALID_REORDER_LEVEL";
  constructor() {
    super("Reorder level must be a non-negative number");
  }
}

export class BulkUpdateError extends BusinessRuleError {
  readonly code = "BULK_UPDATE_ERROR";
  constructor(message: string = "Bulk update operation failed") {
    super(message);
  }
}

export class InventoryExportError extends BusinessRuleError {
  readonly code = "INVENTORY_EXPORT_ERROR";
  constructor(message: string = "Failed to export inventory data") {
    super(message);
  }
}

export class InvalidUpdateDataError extends ValidationError {
  readonly code = "INVALID_UPDATE_DATA";
  constructor(message: string = "Invalid update data provided") {
    super(message);
  }
}