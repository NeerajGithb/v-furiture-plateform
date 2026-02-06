import { NextRequest, NextResponse } from "next/server";
import { DomainError } from "../domain/shared/DomainError";
import { RepositoryError, ValidationError } from "../domain/shared/InfrastructureError";
import { ZodError } from "zod";

export function withRouteErrorHandling<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      return handleError(error);
    }
  };
}

function handleError(error: any): NextResponse {
  console.error("Route error:", error);

  // Domain errors (business logic errors)
  if (error instanceof DomainError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        context: error.context,
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    );
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    const validationErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));

    return NextResponse.json(
      {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: validationErrors,
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  // Repository errors (infrastructure errors)
  if (error instanceof RepositoryError) {
    return NextResponse.json(
      {
        error: "Internal server error",
        code: "REPOSITORY_ERROR",
        operation: error.operation,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }

  // Validation errors
  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        error: error.message,
        code: "VALIDATION_ERROR",
        field: error.field,
        value: error.value,
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || "field";
    return NextResponse.json(
      {
        error: `Duplicate value for ${field}`,
        code: "DUPLICATE_ERROR",
        field,
        timestamp: new Date().toISOString(),
      },
      { status: 409 }
    );
  }

  // Generic errors
  return NextResponse.json(
    {
      error: "Internal server error",
      code: "INTERNAL_ERROR",
      message: process.env.NODE_ENV === "development" ? error.message : undefined,
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}