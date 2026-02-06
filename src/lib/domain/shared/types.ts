// Shared types used across multiple domains

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SortOptions {
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface SearchOptions {
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface QueryOptions extends PaginationOptions, SortOptions, SearchOptions {}