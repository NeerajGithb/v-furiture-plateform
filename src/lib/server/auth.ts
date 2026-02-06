import 'server-only';
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Token names for different user types (from environment or defaults)
const SELLER_ACCESS_TOKEN_NAME = process.env.SELLER_ACCESS_TOKEN_NAME || "seller_access";
const ADMIN_ACCESS_TOKEN_NAME = process.env.ADMIN_ACCESS_TOKEN_NAME || "admin_access";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET");
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

// Token verification function for server components
const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET!) as TokenPayload;
  } catch (error) {
    return null;
  }
};

// Server-only function to get current admin (for server components/layouts)
export const getCurrentAdmin = async (): Promise<AdminTokenPayload | null> => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ADMIN_ACCESS_TOKEN_NAME)?.value;
    
    if (!accessToken) return null;
    
    const payload = verifyAccessToken(accessToken);
    if (!payload || payload.type !== 'admin') return null;
    
    return payload as AdminTokenPayload;
  } catch (error) {
    return null;
  }
};

// Server-only function to get current seller (for server components/layouts)
export const getCurrentSeller = async (): Promise<SellerTokenPayload | null> => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(SELLER_ACCESS_TOKEN_NAME)?.value;
    
    if (!accessToken) return null;
    
    const payload = verifyAccessToken(accessToken);
    if (!payload || payload.type !== 'seller') return null;
    
    return payload as SellerTokenPayload;
  } catch (error) {
    return null;
  }
};