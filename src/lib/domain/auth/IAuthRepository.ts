import { SellerRegisterRequest } from "./AuthSchemas";

export interface Seller {
  id: string;
  email: string;
  businessName: string;
  contactPerson: string;
  phone?: string;
  address?: string;
  businessType?: string;
  gstNumber?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  verified: boolean;
  commission: number;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  status: 'active' | 'inactive';
  createdAt: Date;
  lastLogin?: Date;
}

export interface LoginAttemptInfo {
  success: boolean;
  remainingAttempts?: number;
  locked?: boolean;
  remainingTime?: number;
}

export interface IAuthRepository {
  // Seller operations
  findSellerByEmail(email: string): Promise<Seller | null>;
  findSellerByEmailWithPassword(email: string): Promise<(Seller & { password: string }) | null>;
  findSellerById(id: string): Promise<Seller | null>;
  createSeller(data: SellerRegisterRequest): Promise<Seller>;
  updateSellerLoginInfo(sellerId: string, ipAddress: string): Promise<void>;
  updateSellerPassword(email: string, newPassword: string): Promise<void>;

  // Admin operations
  findAdminByEmail(email: string): Promise<Admin | null>;
  findAdminByEmailWithPassword(email: string): Promise<(Admin & { password: string }) | null>;
  findAdminById(id: string): Promise<Admin | null>;
  updateAdminLoginInfo(adminId: string, ipAddress: string): Promise<void>;
  updateAdminPassword(email: string, newPassword: string): Promise<void>;

  // Security operations
  checkAccountLock(
    email: string,
    userType: 'seller' | 'admin'
  ): Promise<{ locked: boolean; remainingTime?: number }>;
  recordFailedLogin(email: string, userType: 'seller' | 'admin'): Promise<LoginAttemptInfo>;
  resetFailedAttempts(email: string, userType: 'seller' | 'admin'): Promise<void>;

  // Rate limiting
  checkLoginRateLimit(
    ipAddress: string,
    email: string,
  ): Promise<{ success: boolean; message?: string }>;
  checkRegisterRateLimit(
    ipAddress: string,
  ): Promise<{ success: boolean; message?: string }>;

  // Password reset
  storeResetCode(
    email: string,
    userType: 'seller' | 'admin',
    hashedCode: string,
    expires: Date,
  ): Promise<void>;
  verifyResetCode(email: string, userType: 'seller' | 'admin', code: string): Promise<boolean>;
  clearResetCode(email: string, userType: 'seller' | 'admin'): Promise<void>;

  // Email operations
  sendPasswordResetEmail(
    email: string,
    name: string,
    code: string,
    userType: 'seller' | 'admin'
  ): Promise<void>;

  // OTP operations for signup
  storeSignupOtp(
    email: string,
    hashedOtp: string,
    expires: Date,
    signupData: { email: string; password: string }
  ): Promise<void>;
  verifySignupOtp(email: string, otp: string): Promise<boolean>;
  isSignupOtpVerified(email: string): Promise<boolean>;
  clearSignupOtp(email: string): Promise<void>;
  updateSignupOtp(email: string, hashedOtp: string, expires: Date): Promise<void>;
  sendSignupOtpEmail(email: string, otp: string): Promise<void>;
}