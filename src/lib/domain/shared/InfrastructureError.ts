export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: any,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class DatabaseConnectionError extends Error {
  constructor(message: string = "Database connection failed") {
    super(message);
    this.name = "DatabaseConnectionError";
  }
}