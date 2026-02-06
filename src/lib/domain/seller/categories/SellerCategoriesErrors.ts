import { NotFoundError, BusinessRuleError } from "../../shared/DomainError";

export class CategoryNotFoundError extends NotFoundError {
  readonly code = "CATEGORY_NOT_FOUND";
  constructor(categoryId?: string) {
    super(
      categoryId ? `Category with ID ${categoryId} not found` : "Category not found",
      { categoryId }
    );
  }
}

export class CategoryFetchError extends BusinessRuleError {
  readonly code = "CATEGORY_FETCH_ERROR";
  constructor(message: string = "Failed to fetch categories") {
    super(message);
  }
}