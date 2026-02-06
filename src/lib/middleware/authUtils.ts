import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Token names for different user types (from environment or defaults)
const SELLER_ACCESS_TOKEN_NAME = process.env.SELLER_ACCESS_TOKEN_NAME || "seller_access";
const SELLER_REFRESH_TOKEN_NAME = process.env.SELLER_REFRESH_TOKEN_NAME || "seller_refresh";
const ADMIN_ACCESS_TOKEN_NAME = process.env.ADMIN_ACCESS_TOKEN_NAME || "admin_access";
const ADMIN_REFRESH_TOKEN_NAME = process.env.ADMIN_REFRESH_TOKEN_NAME || "admin_refresh";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error("Missing JWT secret(s)");
}

const isProduction = process.env.NODE_ENV === "production";

// Password security constants
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10); // High security salt rounds

interface BaseUser {
  _id: { toString: () => string } | string;
  email: string;
}

interface Seller extends BaseUser {
  businessName: string;
  verified: boolean;
  status: string;
}

interface Admin extends BaseUser {
  name: string;
  role: string;
  permissions: string[];
}

interface BaseTokenPayload {
  userId: string;
  email: string;
  type: 'seller' | 'admin';
  iat?: number;
  exp?: number;
}

interface SellerTokenPayload extends BaseTokenPayload {
  type: 'seller';
  businessName: string;
  verified: boolean;
  status: string;
}

interface AdminTokenPayload extends BaseTokenPayload {
  type: 'admin';
  name: string;
  role: string;
  permissions: string[];
}

type TokenPayload = SellerTokenPayload | AdminTokenPayload;

// Password hashing functions
export const hashPassword = async (password: string): Promise<string> => {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    throw new Error("Failed to hash password");
  }
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error("Failed to verify password");
  }
};

// Token creation functions
export const createSellerAccessToken = (seller: Seller): string =>
  jwt.sign(
    {
      userId: seller._id.toString(),
      email: seller.email,
      type: 'seller',
      businessName: seller.businessName,
      verified: seller.verified,
      status: seller.status,
    } as SellerTokenPayload,
    JWT_SECRET!,
    { expiresIn: "7d" }
  );

export const createSellerRefreshToken = (seller: Seller): string =>
  jwt.sign(
    {
      userId: seller._id.toString(),
      email: seller.email,
      type: 'seller',
    },
    JWT_REFRESH_SECRET!,
    { expiresIn: "30d" }
  );

export const createAdminAccessToken = (admin: Admin): string =>
  jwt.sign(
    {
      userId: admin._id.toString(),
      email: admin.email,
      type: 'admin',
      name: admin.name,
      role: admin.role,
      permissions: admin.permissions,
    } as AdminTokenPayload,
    JWT_SECRET!,
    { expiresIn: "7d" }
  );

export const createAdminRefreshToken = (admin: Admin): string =>
  jwt.sign(
    {
      userId: admin._id.toString(),
      email: admin.email,
      type: 'admin',
    },
    JWT_REFRESH_SECRET!,
    { expiresIn: "30d" }
  );

// Token verification functions
export const verifyAccessToken = async (token: string): Promise<TokenPayload | null> => {
  try {
    return jwt.verify(token, JWT_SECRET!) as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = async (token: string): Promise<TokenPayload | null> => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET!) as TokenPayload;
  } catch (error) {
    return null;
  }
};

// Cookie retrieval functions
export const getSellerAccessTokenFromCookie = async (
  req?: NextRequest,
): Promise<string | null> => {
  try {
    if (req?.cookies) {
      return req.cookies.get(SELLER_ACCESS_TOKEN_NAME)?.value || null;
    }
    const cookieStore = await cookies();
    return cookieStore.get(SELLER_ACCESS_TOKEN_NAME)?.value || null;
  } catch {
    return null;
  }
};

export const getSellerRefreshTokenFromCookie = async (
  req?: NextRequest,
): Promise<string | null> => {
  try {
    if (req?.cookies) return req.cookies.get(SELLER_REFRESH_TOKEN_NAME)?.value || null;
    const cookieStore = await cookies();
    return cookieStore.get(SELLER_REFRESH_TOKEN_NAME)?.value || null;
  } catch {
    return null;
  }
};

export const getAdminAccessTokenFromCookie = async (
  req?: NextRequest,
): Promise<string | null> => {
  try {
    if (req?.cookies) {
      return req.cookies.get(ADMIN_ACCESS_TOKEN_NAME)?.value || null;
    }
    const cookieStore = await cookies();
    return cookieStore.get(ADMIN_ACCESS_TOKEN_NAME)?.value || null;
  } catch {
    return null;
  }
};

export const getAdminRefreshTokenFromCookie = async (
  req?: NextRequest,
): Promise<string | null> => {
  try {
    if (req?.cookies) return req.cookies.get(ADMIN_REFRESH_TOKEN_NAME)?.value || null;
    const cookieStore = await cookies();
    return cookieStore.get(ADMIN_REFRESH_TOKEN_NAME)?.value || null;
  } catch {
    return null;
  }
};

// Current user functions
export const getCurrentSeller = async (
  req?: NextRequest,
): Promise<SellerTokenPayload | null> => {
  const accessToken = await getSellerAccessTokenFromCookie(req);
  if (!accessToken) return null;
  
  const payload = await verifyAccessToken(accessToken);
  if (!payload || payload.type !== 'seller') return null;
  
  return payload as SellerTokenPayload;
};

export const getCurrentAdmin = async (
  req?: NextRequest,
): Promise<AdminTokenPayload | null> => {
  const accessToken = await getAdminAccessTokenFromCookie(req);
  if (!accessToken) return null;
  
  const payload = await verifyAccessToken(accessToken);
  if (!payload || payload.type !== 'admin') return null;
  
  return payload as AdminTokenPayload;
};

export const getCurrentUserAuth = async (
  req?: NextRequest,
): Promise<{ user: TokenPayload; userType: 'seller' | 'admin' } | null> => {
  // Try seller first
  const seller = await getCurrentSeller(req);
  if (seller) {
    return { user: seller, userType: 'seller' };
  }

  // Try admin
  const admin = await getCurrentAdmin(req);
  if (admin) {
    return { user: admin, userType: 'admin' };
  }

  return null;
};

// Cookie setting functions
export const setSellerAuthCookies = (
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
): void => {
  response.cookies.set({
    name: SELLER_ACCESS_TOKEN_NAME,
    value: accessToken,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    // No maxAge = session cookie (expires when browser closes)
  });

  response.cookies.set({
    name: SELLER_REFRESH_TOKEN_NAME,
    value: refreshToken,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    // No maxAge = session cookie (expires when browser closes)
  });
};

export const setAdminAuthCookies = (
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
): void => {
  response.cookies.set({
    name: ADMIN_ACCESS_TOKEN_NAME,
    value: accessToken,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
  });

  response.cookies.set({
    name: ADMIN_REFRESH_TOKEN_NAME,
    value: refreshToken,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
  });
};

// Cookie clearing functions
export const clearSellerAuthCookies = (response: NextResponse): void => {
  response.cookies.set({
    name: SELLER_ACCESS_TOKEN_NAME,
    value: "",
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set({
    name: SELLER_REFRESH_TOKEN_NAME,
    value: "",
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
};

export const clearAdminAuthCookies = (response: NextResponse): void => {
  response.cookies.set({
    name: ADMIN_ACCESS_TOKEN_NAME,
    value: "",
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set({
    name: ADMIN_REFRESH_TOKEN_NAME,
    value: "",
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
};

export const clearAllAuthCookies = (response: NextResponse): void => {
  clearSellerAuthCookies(response);
  clearAdminAuthCookies(response);
};