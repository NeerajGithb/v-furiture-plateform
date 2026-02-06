import { NextRequest, NextResponse } from "next/server";
import { UnauthorizedRoleError, InvalidTokenError, MissingTokenError } from "../domain/auth/AuthErrors";
import { getCurrentAdmin, getCurrentSeller, verifyAccessToken } from "./authUtils";

export interface AuthenticatedAdmin {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN";
}

export interface AuthenticatedSeller {
  id: string;
  email: string;
  businessName: string;
  isVerified: boolean;
  status: string;
}

export type AuthenticatedUser = AuthenticatedAdmin | AuthenticatedSeller;

// Admin authentication middleware
export function withAdminAuth<T extends any[]>(
  handler: (request: NextRequest, admin: AuthenticatedAdmin, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      const adminPayload = await getCurrentAdmin(request);
      if (!adminPayload) {
        throw new MissingTokenError("No valid admin authentication found");
      }

      const authenticatedAdmin: AuthenticatedAdmin = {
        id: adminPayload.userId,
        email: adminPayload.email,
        name: adminPayload.name,
        role: adminPayload.role as "SUPER_ADMIN" | "ADMIN",
      };

      return await handler(request, authenticatedAdmin, ...args);
    } catch (error) {
      return handleAuthError(error);
    }
  };
}

// Optional admin authentication (doesn't throw if no token)
export function withOptionalAdminAuth<T extends any[]>(
  handler: (request: NextRequest, admin: AuthenticatedAdmin | null, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      const adminPayload = await getCurrentAdmin(request);
      if (!adminPayload) {
        return await handler(request, null, ...args);
      }

      const authenticatedAdmin: AuthenticatedAdmin = {
        id: adminPayload.userId,
        email: adminPayload.email,
        name: adminPayload.name,
        role: adminPayload.role as "SUPER_ADMIN" | "ADMIN",
      };

      return await handler(request, authenticatedAdmin, ...args);
    } catch (error) {
      // For optional auth, continue without admin if token is invalid
      return await handler(request, null, ...args);
    }
  };
}

// Seller authentication middleware
export function withSellerAuth<T extends any[]>(
  handler: (request: NextRequest, seller: AuthenticatedSeller, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      const sellerPayload = await getCurrentSeller(request);
      if (!sellerPayload) {
        throw new MissingTokenError("No valid seller authentication found");
      }

      const authenticatedSeller: AuthenticatedSeller = {
        id: sellerPayload.userId,
        email: sellerPayload.email,
        businessName: sellerPayload.businessName,
        isVerified: sellerPayload.verified,
        status: sellerPayload.status,
      };

      return await handler(request, authenticatedSeller, ...args);
    } catch (error) {
      return handleAuthError(error);
    }
  };
}

// Super admin only middleware
export function withSuperAdminAuth<T extends any[]>(
  handler: (request: NextRequest, admin: AuthenticatedAdmin, ...args: T) => Promise<NextResponse>
) {
  return withAdminAuth(async (request: NextRequest, admin: AuthenticatedAdmin, ...args: T) => {
    if (admin.role !== "SUPER_ADMIN") {
      throw new UnauthorizedRoleError("SUPER_ADMIN");
    }
    return await handler(request, admin, ...args);
  });
}


function handleAuthError(error: any): NextResponse {
  if (error instanceof MissingTokenError || error instanceof InvalidTokenError || error instanceof UnauthorizedRoleError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    return NextResponse.json(
      { error: "Invalid authentication token", code: "INVALID_TOKEN" },
      { status: 401 }
    );
  }

  if (error.name === "TokenExpiredError") {
    return NextResponse.json(
      { error: "Authentication token expired", code: "TOKEN_EXPIRED" },
      { status: 401 }
    );
  }

  // Generic error
  console.error("Authentication error:", error);
  return NextResponse.json(
    { error: "Authentication failed", code: "AUTH_ERROR" },
    { status: 500 }
  );
}