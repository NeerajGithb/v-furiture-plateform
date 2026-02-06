import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp: string;
}

export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta?: Record<string, any>;
}

export class ApiResponseBuilder {
  static success<T>(data: T, meta?: Record<string, any>): NextResponse {
    const response: ApiResponse<T> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };

    if (meta) {
      (response as any).meta = meta;
    }

    return NextResponse.json(response, { status: 200 });
  }

  static created<T>(data: T, meta?: Record<string, any>): NextResponse {
    const response: ApiResponse<T> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };

    if (meta) {
      (response as any).meta = meta;
    }

    return NextResponse.json(response, { status: 201 });
  }

  static paginated<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    },
    meta?: Record<string, any>
  ): NextResponse {
    const response: PaginatedApiResponse<T> = {
      success: true,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    };

    if (meta) {
      response.meta = meta;
    }

    return NextResponse.json(response, { status: 200 });
  }

  static noContent(): NextResponse {
    return new NextResponse(null, { status: 204 });
  }

  static error(
    message: string,
    code: string = "ERROR",
    statusCode: number = 500,
    meta?: Record<string, any>
  ): NextResponse {
    const response: ApiResponse = {
      success: false,
      error: message,
      code,
      timestamp: new Date().toISOString(),
    };

    if (meta) {
      (response as any).meta = meta;
    }

    return NextResponse.json(response, { status: statusCode });
  }

  static badRequest(message: string, code: string = "BAD_REQUEST"): NextResponse {
    return this.error(message, code, 400);
  }

  static unauthorized(message: string = "Unauthorized", code: string = "UNAUTHORIZED"): NextResponse {
    return this.error(message, code, 401);
  }

  static forbidden(message: string = "Forbidden", code: string = "FORBIDDEN"): NextResponse {
    return this.error(message, code, 403);
  }

  static notFound(message: string = "Not found", code: string = "NOT_FOUND"): NextResponse {
    return this.error(message, code, 404);
  }

  static conflict(message: string, code: string = "CONFLICT"): NextResponse {
    return this.error(message, code, 409);
  }

  static validationError(
    message: string,
    details?: Array<{ field: string; message: string; code?: string }>
  ): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: message,
        code: "VALIDATION_ERROR",
        details,
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }
}