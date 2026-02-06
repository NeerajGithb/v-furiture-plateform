import { NotFoundError, BusinessRuleError } from "../../shared/DomainError";

export class ProductNotFoundError extends NotFoundError {
  readonly code = "PRODUCT_NOT_FOUND";
  constructor(productId?: string) {
    super(
      productId ? `Product with ID ${productId} not found` : "Product not found",
      { productId }
    );
  }
}

export class ProductsFetchError extends BusinessRuleError {
  readonly code = "PRODUCTS_FETCH_ERROR";
  constructor(message: string = "Failed to fetch products") {
    super(message);
  }
}

export class ProductCreateError extends BusinessRuleError {
  readonly code = "PRODUCT_CREATE_ERROR";
  constructor(message: string = "Failed to create product") {
    super(message);
  }
}

export class ProductUpdateError extends BusinessRuleError {
  readonly code = "PRODUCT_UPDATE_ERROR";
  constructor(message: string = "Failed to update product") {
    super(message);
  }
}

export class ProductDeleteError extends BusinessRuleError {
  readonly code = "PRODUCT_DELETE_ERROR";
  constructor(message: string = "Failed to delete product") {
    super(message);
  }
}

export class UnauthorizedProductAccessError extends BusinessRuleError {
  readonly code = "UNAUTHORIZED_PRODUCT_ACCESS";
  constructor(message: string = "Unauthorized to access this product") {
    super(message);
  }
}

export class SellerAccountInactiveError extends BusinessRuleError {
  readonly code = "SELLER_ACCOUNT_INACTIVE";
  constructor() {
    super("Your account must be approved before you can add products. Please wait for admin approval.");
  }
}

export class BulkProductUpdateError extends BusinessRuleError {
  readonly code = "BULK_PRODUCT_UPDATE_ERROR";
  constructor(message: string = "Failed to bulk update products") {
    super(message);
  }
}

export class ProductExportError extends BusinessRuleError {
  readonly code = "PRODUCT_EXPORT_ERROR";
  constructor(message: string = "Failed to export products") {
    super(message);
  }
}