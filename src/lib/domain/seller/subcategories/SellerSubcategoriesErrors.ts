import { NotFoundError, BusinessRuleError } from "../../shared/DomainError";

export class SubcategoryNotFoundError extends NotFoundError {
  readonly code = "SUBCATEGORY_NOT_FOUND";
  constructor(subcategoryId?: string) {
    super(
      subcategoryId ? `Subcategory with ID ${subcategoryId} not found` : "Subcategory not found",
      { subcategoryId }
    );
  }
}

export class SubcategoryFetchError extends BusinessRuleError {
  readonly code = "SUBCATEGORY_FETCH_ERROR";
  constructor(message: string = "Failed to fetch subcategories") {
    super(message);
  }
}