import {
  IAuthRepository,
  Seller,
  Admin,
  LoginAttemptInfo,
} from "./IAuthRepository";
import { RepositoryError } from "../shared/InfrastructureError";
import { SellerRegisterRequest } from "./AuthSchemas";
import SellerModel from "@/models/Seller";
import AdminModel from "@/models/Admin";
import { hashPassword, verifyPassword } from "@/lib/middleware/authUtils";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCK_SECONDS = 15 * 60; // 15 minutes
const LOGIN_RATE_LIMIT_MAX = 10;
const LOGIN_RATE_LIMIT_WINDOW = 60 * 60; // 1 hour
const REGISTER_RATE_LIMIT_MAX = 5;
const REGISTER_RATE_LIMIT_WINDOW = 60 * 60; // 1 hour

export class AuthRepository implements IAuthRepository {
  // Seller operations
  async findSellerByEmail(email: string): Promise<Seller | null> {
    try {
      const seller = await SellerModel.findOne({ email }).lean();
      return seller ? this.mapToSellerType(seller) : null;
    } catch (error) {
      throw new RepositoryError("Failed to find seller by email", "findSellerByEmail", error as Error);
    }
  }

  async findSellerByEmailWithPassword(email: string): Promise<(Seller & { password: string }) | null> {
    try {
      const seller = await SellerModel.findOne({ email })
        .select("+password")
        .lean() as any;
      return seller ? { ...this.mapToSellerType(seller), password: seller.password } : null;
    } catch (error) {
      throw new RepositoryError(
        "Failed to find seller by email with password",
        "findSellerByEmailWithPassword",
        error as Error,
      );
    }
  }

  async findSellerById(id: string): Promise<Seller | null> {
    try {
      const seller = await SellerModel.findById(id).lean();
      return seller ? this.mapToSellerType(seller) : null;
    } catch (error) {
      throw new RepositoryError("Failed to find seller by ID", "findSellerById", error as Error);
    }
  }

  async createSeller(data: SellerRegisterRequest): Promise<Seller> {
    try {
      const hashedPassword = await hashPassword(data.password);
      
      const sellerData = {
        ...data,
        password: hashedPassword,
        email: data.email.toLowerCase(),
        status: 'pending' as const,
        verified: false,
        commission: 10, // Default commission
      };

      const seller = await SellerModel.create(sellerData);
      return this.mapToSellerType(seller.toObject());
    } catch (error) {
      throw new RepositoryError("Failed to create seller", "createSeller", error as Error);
    }
  }

  async updateSellerLoginInfo(sellerId: string, ipAddress: string): Promise<void> {
    try {
      await SellerModel.findByIdAndUpdate(sellerId, {
        lastLogin: new Date(),
        // You can add IP tracking if needed
      });
    } catch (error) {
      throw new RepositoryError("Failed to update seller login info", "updateSellerLoginInfo", error as Error);
    }
  }

  async updateSellerPassword(email: string, newPassword: string): Promise<void> {
    try {
      const hashedPassword = await hashPassword(newPassword);
      await SellerModel.findOneAndUpdate(
        { email },
        { password: hashedPassword }
      );
    } catch (error) {
      throw new RepositoryError("Failed to update seller password", "updateSellerPassword", error as Error);
    }
  }

  // Admin operations
  async findAdminByEmail(email: string): Promise<Admin | null> {
    try {
      const admin = await AdminModel.findOne({ email }).lean();
      return admin ? this.mapToAdminType(admin) : null;
    } catch (error) {
      throw new RepositoryError("Failed to find admin by email", "findAdminByEmail", error as Error);
    }
  }

  async findAdminByEmailWithPassword(email: string): Promise<(Admin & { password: string }) | null> {
    try {
      const admin = await AdminModel.findOne({ email })
        .select("+password")
        .lean() as any;
      return admin ? { ...this.mapToAdminType(admin), password: admin.password } : null;
    } catch (error) {
      throw new RepositoryError(
        "Failed to find admin by email with password",
        "findAdminByEmailWithPassword",
        error as Error,
      );
    }
  }

  async findAdminById(id: string): Promise<Admin | null> {
    try {
      const admin = await AdminModel.findById(id).lean();
      return admin ? this.mapToAdminType(admin) : null;
    } catch (error) {
      throw new RepositoryError("Failed to find admin by ID", "findAdminById", error as Error);
    }
  }

  async updateAdminLoginInfo(adminId: string, ipAddress: string): Promise<void> {
    try {
      await AdminModel.findByIdAndUpdate(adminId, {
        lastLogin: new Date(),
        // You can add IP tracking if needed
      });
    } catch (error) {
      throw new RepositoryError("Failed to update admin login info", "updateAdminLoginInfo", error as Error);
    }
  }

  async updateAdminPassword(email: string, newPassword: string): Promise<void> {
    try {
      const hashedPassword = await hashPassword(newPassword);
      await AdminModel.findOneAndUpdate(
        { email },
        { password: hashedPassword }
      );
    } catch (error) {
      throw new RepositoryError("Failed to update admin password", "updateAdminPassword", error as Error);
    }
  }

  // Security operations (simplified for now - you can enhance with Redis later)
  async checkAccountLock(
    email: string,
    userType: 'seller' | 'admin'
  ): Promise<{ locked: boolean; remainingTime?: number }> {
    const key = `auth:lock:${userType}:${email.toLowerCase()}`;
    const record = await redis.get<{ lockedUntil: number }>(key);
    if (!record) return { locked: false };
    const remaining = Math.ceil((record.lockedUntil - Date.now()) / 1000);
    if (remaining <= 0) {
      await redis.del(key);
      return { locked: false };
    }
    return { locked: true, remainingTime: remaining };
  }

  async recordFailedLogin(email: string, userType: 'seller' | 'admin'): Promise<LoginAttemptInfo> {
    const key = `auth:attempts:${userType}:${email.toLowerCase()}`;
    const attempts = await redis.incr(key);
    if (attempts === 1) await redis.expire(key, LOGIN_LOCK_SECONDS);

    if (attempts >= LOGIN_MAX_ATTEMPTS) {
      const lockKey = `auth:lock:${userType}:${email.toLowerCase()}`;
      await redis.set(lockKey, { lockedUntil: Date.now() + LOGIN_LOCK_SECONDS * 1000 }, { ex: LOGIN_LOCK_SECONDS });
      await redis.del(key);
      return { success: false, locked: true, remainingTime: LOGIN_LOCK_SECONDS };
    }
    return { success: false, remainingAttempts: LOGIN_MAX_ATTEMPTS - attempts };
  }

  async resetFailedAttempts(email: string, userType: 'seller' | 'admin'): Promise<void> {
    await redis.del(`auth:attempts:${userType}:${email.toLowerCase()}`);
    await redis.del(`auth:lock:${userType}:${email.toLowerCase()}`);
  }

  // Rate limiting (simplified for now)
  async checkLoginRateLimit(
    ipAddress: string,
    email: string,
  ): Promise<{ success: boolean; message?: string }> {
    const key = `rate:login:${ipAddress}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, LOGIN_RATE_LIMIT_WINDOW);
    if (count > LOGIN_RATE_LIMIT_MAX) {
      return { success: false, message: 'Too many login attempts. Please try again later.' };
    }
    return { success: true };
  }

  async checkRegisterRateLimit(
    ipAddress: string,
  ): Promise<{ success: boolean; message?: string }> {
    const key = `rate:register:${ipAddress}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, REGISTER_RATE_LIMIT_WINDOW);
    if (count > REGISTER_RATE_LIMIT_MAX) {
      return { success: false, message: 'Too many registration attempts. Please try again later.' };
    }
    return { success: true };
  }

  // Password reset (seller only)
  async storeResetCode(email: string, otp: string, salt: string, expires: Date): Promise<void> {
    try {
      const { hashOtp } = await import("@/lib/utils/otp");
      const result = await SellerModel.findOneAndUpdate(
        { email: email.toLowerCase() },
        {
          $set: {
            resetCode: hashOtp(otp, salt),
            resetCodeSalt: salt,
            resetCodeExpires: expires,
          },
        },
        { new: true }
      );
      if (!result) {
        throw new RepositoryError("Seller not found", "storeResetCode");
      }
    } catch (error) {
      if (error instanceof RepositoryError) throw error;
      throw new RepositoryError("Failed to store reset code", "storeResetCode", error as Error);
    }
  }

  async verifyResetCode(email: string, code: string): Promise<boolean> {
    try {
      const user = await SellerModel.findOne({
        email: email.toLowerCase(),
        resetCodeExpires: { $gt: new Date() },
      })
        .select('+resetCode +resetCodeSalt')
        .lean() as any;

      if (!user?.resetCode || !user?.resetCodeSalt) {
        return false;
      }

      const { verifyOtp } = await import("@/lib/utils/otp");
      return verifyOtp(code, user.resetCodeSalt, user.resetCode);
    } catch (error) {
      throw new RepositoryError("Failed to verify reset code", "verifyResetCode", error as Error);
    }
  }

  async clearResetCode(email: string): Promise<void> {
    try {
      await SellerModel.findOneAndUpdate(
        { email: email.toLowerCase() },
        { $unset: { resetCode: 1, resetCodeSalt: 1, resetCodeExpires: 1 } }
      );
    } catch (error) {
      throw new RepositoryError("Failed to clear reset code", "clearResetCode", error as Error);
    }
  }

  async sendPasswordResetEmail(email: string, name: string, code: string): Promise<void> {
    const { sendEmail, getResetPasswordOTPEmailHTML } = await import('@/lib/emailService');
    const html = getResetPasswordOTPEmailHTML(code, name);
    const sent = await sendEmail({
      to: email,
      subject: '🔐 Reset Your Password - VFurniture',
      html,
      text: `Hi ${name},\n\nYour password reset code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, ignore this email.`,
    });
    if (!sent) {
      throw new RepositoryError("Email delivery failed", "sendPasswordResetEmail");
    }
  }

  // OTP operations for signup
  async storeSignupOtp(
    email: string,
    otp: string,
    _salt: string,
    expires: Date,
    signupData: { email: string; password: string }
  ): Promise<void> {
    try {
      const key = `signup:data:${email.toLowerCase()}`;
      const ttl = Math.ceil((expires.getTime() - Date.now()) / 1000);
      await redis.set(key, signupData, { ex: ttl > 0 ? ttl : 300 });
    } catch (error) {
      throw new RepositoryError("Failed to store signup OTP", "storeSignupOtp", error as Error);
    }
  }

  async verifySignupOtp(email: string, otp: string): Promise<boolean> {
    try {
      const { verifyOTP } = await import('@/lib/otpService');
      const result = await verifyOTP(email, otp);
      return result.success;
    } catch (error) {
      throw new RepositoryError("Failed to verify signup OTP", "verifySignupOtp", error as Error);
    }
  }

  async isSignupOtpVerified(email: string): Promise<boolean> {
    try {
      const { isEmailVerified } = await import('@/lib/otpService');
      return await isEmailVerified(email);
    } catch (error) {
      throw new RepositoryError("Failed to check OTP verification", "isSignupOtpVerified", error as Error);
    }
  }

  async clearSignupOtp(email: string): Promise<void> {
    try {
      const { clearOTPRecord } = await import('@/lib/otpService');
      await clearOTPRecord(email);
      await redis.del(`signup:data:${email.toLowerCase()}`);
    } catch (error) {
      throw new RepositoryError("Failed to clear signup OTP", "clearSignupOtp", error as Error);
    }
  }

  async updateSignupOtp(email: string, _otp: string, _salt: string, expires: Date): Promise<void> {
    try {
      // Clear old OTP record (new one will be stored by sendSignupOtpEmail → storeOTP)
      await redis.del(`otp:${email.toLowerCase()}`);
      // Refresh signup data TTL so credentials don't expire before step 2
      const key = `signup:data:${email.toLowerCase()}`;
      const existing = await redis.get<{ email: string; password: string }>(key);
      if (existing) {
        const ttl = Math.ceil((expires.getTime() - Date.now()) / 1000);
        await redis.set(key, existing, { ex: ttl > 0 ? ttl : 300 });
      }
    } catch (error) {
      throw new RepositoryError("Failed to update signup OTP", "updateSignupOtp", error as Error);
    }
  }

  async sendSignupOtpEmail(email: string, otp: string, userName: string = 'User'): Promise<void> {
    try {
      const { sendOTPEmail } = await import('@/lib/otpService');
      const sent = await sendOTPEmail(email, otp, userName);
      if (!sent) {
        throw new Error('Email delivery failed');
      }
    } catch (error) {
      throw new RepositoryError("Failed to send signup OTP email", "sendSignupOtpEmail", error as Error);
    }
  }
  async getSignupData(email: string): Promise<{ email: string; password: string } | null> {
      try {
        const key = `signup:data:${email.toLowerCase()}`;
        const data = await redis.get<{ email: string; password: string }>(key);
        return data ?? null;
      } catch (error) {
        throw new RepositoryError("Failed to get signup data", "getSignupData", error as Error);
      }
    }

  // Helper methods
  private mapToSellerType(seller: any): Seller {
    return {
      id: seller._id.toString(),
      email: seller.email,
      businessName: seller.businessName,
      contactPerson: seller.contactPerson,
      phone: seller.phone,
      address: seller.address,
      businessType: seller.businessType,
      gstNumber: seller.gstNumber,
      status: seller.status,
      verified: seller.verified,
      commission: seller.commission,
      createdAt: seller.createdAt,
      lastLogin: seller.lastLogin,
    };
  }

  private mapToAdminType(admin: any): Admin {
    return {
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role,
      permissions: admin.permissions || [],
      status: admin.status,
      createdAt: admin.createdAt,
      lastLogin: admin.lastLogin,
    };
  }
}