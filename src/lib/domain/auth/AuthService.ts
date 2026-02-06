import { IAuthRepository } from "./IAuthRepository";
import { AuthRepository } from "./AuthRepository";
import {
  SellerLoginRequest,
  SellerRegisterRequest,
  AdminLoginRequest,
  SendResetCodeRequest,
  VerifyResetCodeRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from "./AuthSchemas";
import {
  SellerNotFoundError,
  AdminNotFoundError,
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  AccountSuspendedError,
  AccountInactiveError,
  AccountPendingError,
  AccountLockedError,
  RateLimitExceededError,
  InvalidResetCodeError,
  InvalidTokenError,
  MissingTokenError,
} from "./AuthErrors";
import {
  hashPassword,
  verifyPassword,
  createSellerAccessToken,
  createSellerRefreshToken,
  createAdminAccessToken,
  createAdminRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/lib/middleware/authUtils";
import crypto from "crypto";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SellerLoginResult {
  message: string;
  seller: {
    id: string;
    email: string;
    businessName: string;
    verified: boolean;
    status: string;
  };
  tokens: AuthTokens;
}

export interface AdminLoginResult {
  message: string;
  admin: {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
  };
  tokens: AuthTokens;
}

export interface SellerRegisterResult {
  message: string;
  seller: {
    id: string;
    businessName: string;
    email: string;
    status: string;
  };
}

export class AuthService {
  constructor(private repository: IAuthRepository = new AuthRepository()) {}

  // Seller login
  async sellerLogin(
    data: SellerLoginRequest,
    ipAddress: string,
    userAgent: string,
  ): Promise<SellerLoginResult> {
    const { email, password } = data;

    // Apply rate limiting
    const rateLimitCheck = await this.repository.checkLoginRateLimit(ipAddress, email);
    if (!rateLimitCheck.success) {
      throw new RateLimitExceededError(
        rateLimitCheck.message || "Too many login attempts",
      );
    }

    // Check if account is locked
    const lockStatus = await this.repository.checkAccountLock(email, 'seller');
    if (lockStatus.locked) {
      throw new AccountLockedError(lockStatus.remainingTime || 0);
    }

    // Find seller with password
    const seller = await this.repository.findSellerByEmailWithPassword(email);
    if (!seller) {
      await this.repository.recordFailedLogin(email, 'seller');
      throw new SellerNotFoundError(email);
    }

    // Check account status
    if (seller.status === 'suspended') {
      throw new AccountSuspendedError();
    }
    if (seller.status === 'inactive') {
      throw new AccountInactiveError();
    }
    if (seller.status === 'pending') {
      throw new AccountPendingError();
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, seller.password);
    if (!isPasswordValid) {
      await this.repository.recordFailedLogin(email, 'seller');
      throw new InvalidCredentialsError();
    }

    // Reset failed attempts on successful login
    await this.repository.resetFailedAttempts(email, 'seller');

    // Update login info
    await this.repository.updateSellerLoginInfo(seller.id, ipAddress);

    // Generate tokens
    const accessToken = createSellerAccessToken({
      _id: seller.id,
      email: seller.email,
      businessName: seller.businessName,
      verified: seller.verified,
      status: seller.status,
    });
    const refreshToken = createSellerRefreshToken({
      _id: seller.id,
      email: seller.email,
      businessName: seller.businessName,
      verified: seller.verified,
      status: seller.status,
    });

    const tokens = { accessToken, refreshToken };

    return {
      message: "Login successful",
      seller: {
        id: seller.id,
        email: seller.email,
        businessName: seller.businessName,
        verified: seller.verified,
        status: seller.status,
      },
      tokens,
    };
  }

  // Admin login
  async adminLogin(
    data: AdminLoginRequest,
    ipAddress: string,
    userAgent: string,
  ): Promise<AdminLoginResult> {
    const { email, password } = data;

    // Apply rate limiting
    const rateLimitCheck = await this.repository.checkLoginRateLimit(ipAddress, email);
    if (!rateLimitCheck.success) {
      throw new RateLimitExceededError(
        rateLimitCheck.message || "Too many login attempts",
      );
    }

    // Check if account is locked
    const lockStatus = await this.repository.checkAccountLock(email, 'admin');
    if (lockStatus.locked) {
      throw new AccountLockedError(lockStatus.remainingTime || 0);
    }

    // Find admin with password
    const admin = await this.repository.findAdminByEmailWithPassword(email);
    if (!admin) {
      await this.repository.recordFailedLogin(email, 'admin');
      throw new AdminNotFoundError(email);
    }

    // Check account status
    if (admin.status === 'inactive') {
      throw new AccountInactiveError();
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, admin.password);
    if (!isPasswordValid) {
      await this.repository.recordFailedLogin(email, 'admin');
      throw new InvalidCredentialsError();
    }

    // Reset failed attempts on successful login
    await this.repository.resetFailedAttempts(email, 'admin');

    // Update login info
    await this.repository.updateAdminLoginInfo(admin.id, ipAddress);

    // Generate tokens
    const accessToken = createAdminAccessToken({
      _id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      permissions: admin.permissions,
    });
    const refreshToken = createAdminRefreshToken({
      _id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      permissions: admin.permissions,
    });

    const tokens = { accessToken, refreshToken };

    return {
      message: "Login successful",
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions,
      },
      tokens,
    };
  }

  // Seller registration
  async sellerRegister(
    data: SellerRegisterRequest,
    ipAddress: string,
    userAgent: string,
  ): Promise<SellerRegisterResult> {
    // Apply rate limiting
    const rateLimitCheck = await this.repository.checkRegisterRateLimit(ipAddress);
    if (!rateLimitCheck.success) {
      throw new RateLimitExceededError(
        rateLimitCheck.message || "Too many registration attempts",
      );
    }

    // Check if email already exists
    const existingSeller = await this.repository.findSellerByEmail(data.email);
    if (existingSeller) {
      throw new EmailAlreadyExistsError(data.email);
    }

    // Create seller
    const seller = await this.repository.createSeller(data);

    return {
      message: "Registration successful. Your account is pending approval.",
      seller: {
        id: seller.id,
        businessName: seller.businessName,
        email: seller.email,
        status: seller.status,
      },
    };
  }

  // Multi-step seller signup - Step 1: Email and password validation, send OTP
  async sellerSignupStep1(
    data: { email: string; password: string },
    ipAddress: string,
  ): Promise<{ message: string }> {
    const { email, password } = data;

    // Apply rate limiting
    const rateLimitCheck = await this.repository.checkRegisterRateLimit(ipAddress);
    if (!rateLimitCheck.success) {
      throw new RateLimitExceededError(
        rateLimitCheck.message || "Too many registration attempts",
      );
    }

    // Check if email already exists
    const existingSeller = await this.repository.findSellerByEmail(email);
    if (existingSeller) {
      throw new EmailAlreadyExistsError(email);
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = await hashPassword(otp);
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP and temporary signup data
    await this.repository.storeSignupOtp(email, hashedOtp, expires, { email, password });

    // Send OTP email
    await this.repository.sendSignupOtpEmail(email, otp);

    return {
      message: "Verification code sent to your email",
    };
  }

  // Verify OTP for signup
  async verifySignupOtp(data: { email: string; otp: string }): Promise<{ message: string }> {
    const { email, otp } = data;

    const isValid = await this.repository.verifySignupOtp(email, otp);
    if (!isValid) {
      throw new InvalidResetCodeError(); // Reusing error for OTP
    }

    return {
      message: "Email verified successfully",
    };
  }

  // Multi-step seller signup - Step 2: Complete registration with business info
  async sellerSignupStep2(
    data: SellerRegisterRequest,
    ipAddress: string,
    userAgent: string,
  ): Promise<SellerRegisterResult> {
    const { email } = data;

    // Verify that OTP was verified for this email
    const otpVerified = await this.repository.isSignupOtpVerified(email);
    if (!otpVerified) {
      throw new InvalidResetCodeError();
    }

    // Check if email already exists (double check)
    const existingSeller = await this.repository.findSellerByEmail(email);
    if (existingSeller) {
      throw new EmailAlreadyExistsError(email);
    }

    // Create seller
    const seller = await this.repository.createSeller(data);

    // Clear OTP data
    await this.repository.clearSignupOtp(email);

    return {
      message: "Registration successful. Your account is pending approval.",
      seller: {
        id: seller.id,
        businessName: seller.businessName,
        email: seller.email,
        status: seller.status,
      },
    };
  }

  // Resend OTP for signup
  async resendSignupOtp(
    data: { email: string },
    ipAddress: string,
  ): Promise<{ message: string; attemptsRemaining?: number }> {
    const { email } = data;

    // Apply rate limiting
    const rateLimitCheck = await this.repository.checkRegisterRateLimit(ipAddress);
    if (!rateLimitCheck.success) {
      throw new RateLimitExceededError(
        rateLimitCheck.message || "Too many OTP requests",
      );
    }

    // Generate new OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = await hashPassword(otp);
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Update OTP
    await this.repository.updateSignupOtp(email, hashedOtp, expires);

    // Send OTP email
    await this.repository.sendSignupOtpEmail(email, otp);

    return {
      message: "New verification code sent to your email",
      attemptsRemaining: 3, // You can implement actual tracking
    };
  }

  // Send reset code
  async sendResetCode(data: SendResetCodeRequest): Promise<{ message: string }> {
    const { email, userType } = data;

    // Find user
    const user = userType === 'seller' 
      ? await this.repository.findSellerByEmail(email)
      : await this.repository.findAdminByEmail(email);

    if (!user) {
      if (userType === 'seller') {
        throw new SellerNotFoundError(email);
      } else {
        throw new AdminNotFoundError(email);
      }
    }

    // Generate reset code
    const resetCode = crypto.randomInt(100000, 999999).toString();
    const hashedCode = await hashPassword(resetCode);
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store reset code
    await this.repository.storeResetCode(email, userType, hashedCode, expires);

    // Send email
    const name = userType === 'seller' ? (user as any).businessName : (user as any).name;
    await this.repository.sendPasswordResetEmail(email, name, resetCode, userType);

    return {
      message: "Reset code sent to your email",
    };
  }

  // Verify reset code
  async verifyResetCode(data: VerifyResetCodeRequest): Promise<{ message: string }> {
    const { email, code, userType } = data;

    const isValid = await this.repository.verifyResetCode(email, userType, code);
    if (!isValid) {
      throw new InvalidResetCodeError();
    }

    return {
      message: "Reset code verified successfully",
    };
  }

  // Reset password
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const { email, newPassword, userType } = data;

    // Verify reset code is still valid (you might want to require code verification first)
    // For now, we'll just update the password and clear the reset code

    // Update password
    if (userType === 'seller') {
      await this.repository.updateSellerPassword(email, newPassword);
    } else {
      await this.repository.updateAdminPassword(email, newPassword);
    }

    // Clear reset code
    await this.repository.clearResetCode(email, userType);

    return {
      message: "Password reset successfully",
    };
  }

  // Logout
  async logout(token: string): Promise<{ success: boolean; message: string }> {
    // TODO: Add token to blacklist if using Redis
    return {
      success: true,
      message: "Logged out successfully",
    };
  }

  // Verify token
  async verifyToken(token: string): Promise<any> {
    const decoded = await verifyAccessToken(token);
    if (!decoded) {
      throw new InvalidTokenError();
    }
    return decoded;
  }

  // Get current user
  async getCurrentUser(token: string, userType: 'seller' | 'admin'): Promise<any> {
    const decoded = await this.verifyToken(token);
    
    if (decoded.type !== userType) {
      throw new InvalidTokenError("Invalid user type");
    }

    if (userType === 'seller') {
      const seller = await this.repository.findSellerById(decoded.userId);
      if (!seller) {
        throw new SellerNotFoundError();
      }
      return seller;
    } else {
      const admin = await this.repository.findAdminById(decoded.userId);
      if (!admin) {
        throw new AdminNotFoundError();
      }
      return admin;
    }
  }
}

// Create default instance
export const authService = new AuthService();