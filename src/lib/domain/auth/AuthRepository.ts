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
import crypto from "crypto";

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
    // TODO: Implement with Redis or database tracking
    return { locked: false };
  }

  async recordFailedLogin(email: string, userType: 'seller' | 'admin'): Promise<LoginAttemptInfo> {
    // TODO: Implement with Redis or database tracking
    return { success: false };
  }

  async resetFailedAttempts(email: string, userType: 'seller' | 'admin'): Promise<void> {
    // TODO: Implement with Redis or database tracking
  }

  // Rate limiting (simplified for now)
  async checkLoginRateLimit(
    ipAddress: string,
    email: string,
  ): Promise<{ success: boolean; message?: string }> {
    // TODO: Implement with Redis
    return { success: true };
  }

  async checkRegisterRateLimit(
    ipAddress: string,
  ): Promise<{ success: boolean; message?: string }> {
    // TODO: Implement with Redis
    return { success: true };
  }

  // Password reset (simplified for now)
  async storeResetCode(
    email: string,
    userType: 'seller' | 'admin',
    hashedCode: string,
    expires: Date,
  ): Promise<void> {
    try {
      const Model = userType === 'seller' ? SellerModel : AdminModel;
      await Model.findOneAndUpdate(
        { email },
        {
          resetCode: hashedCode,
          resetCodeExpires: expires,
        }
      );
    } catch (error) {
      throw new RepositoryError("Failed to store reset code", "storeResetCode", error as Error);
    }
  }

  async verifyResetCode(email: string, userType: 'seller' | 'admin', code: string): Promise<boolean> {
    try {
      const Model = userType === 'seller' ? SellerModel : AdminModel;
      const user = await Model.findOne({
        email,
        resetCodeExpires: { $gt: new Date() }
      }).select('+resetCode');

      if (!user || !user.resetCode) {
        return false;
      }

      return await verifyPassword(code, user.resetCode);
    } catch (error) {
      throw new RepositoryError("Failed to verify reset code", "verifyResetCode", error as Error);
    }
  }

  async clearResetCode(email: string, userType: 'seller' | 'admin'): Promise<void> {
    try {
      const Model = userType === 'seller' ? SellerModel : AdminModel;
      await Model.findOneAndUpdate(
        { email },
        {
          $unset: {
            resetCode: 1,
            resetCodeExpires: 1,
          }
        }
      );
    } catch (error) {
      throw new RepositoryError("Failed to clear reset code", "clearResetCode", error as Error);
    }
  }

  // Email operations (simplified for now)
  async sendPasswordResetEmail(
    email: string,
    name: string,
    code: string,
    userType: 'seller' | 'admin'
  ): Promise<void> {
    // TODO: Implement email service
    console.log(`Sending reset code ${code} to ${email} (${userType})`);
  }

  // OTP operations for signup
  async storeSignupOtp(
    email: string,
    hashedOtp: string,
    expires: Date,
    signupData: { email: string; password: string }
  ): Promise<void> {
    try {
      // For now, store in memory or use a simple cache
      // In production, you'd use Redis or a database table
      console.log(`Storing OTP for ${email}, expires at ${expires}`);
      // TODO: Implement proper OTP storage
    } catch (error) {
      throw new RepositoryError("Failed to store signup OTP", "storeSignupOtp", error as Error);
    }
  }

  async verifySignupOtp(email: string, otp: string): Promise<boolean> {
    try {
      // TODO: Implement OTP verification
      console.log(`Verifying OTP ${otp} for ${email}`);
      // For now, accept any 6-digit code
      return /^\d{6}$/.test(otp);
    } catch (error) {
      throw new RepositoryError("Failed to verify signup OTP", "verifySignupOtp", error as Error);
    }
  }

  async isSignupOtpVerified(email: string): Promise<boolean> {
    try {
      // TODO: Check if OTP was verified for this email
      console.log(`Checking if OTP verified for ${email}`);
      return true; // For now, always return true
    } catch (error) {
      throw new RepositoryError("Failed to check OTP verification", "isSignupOtpVerified", error as Error);
    }
  }

  async clearSignupOtp(email: string): Promise<void> {
    try {
      // TODO: Clear OTP data for email
      console.log(`Clearing OTP data for ${email}`);
    } catch (error) {
      throw new RepositoryError("Failed to clear signup OTP", "clearSignupOtp", error as Error);
    }
  }

  async updateSignupOtp(email: string, hashedOtp: string, expires: Date): Promise<void> {
    try {
      // TODO: Update OTP for email
      console.log(`Updating OTP for ${email}, expires at ${expires}`);
    } catch (error) {
      throw new RepositoryError("Failed to update signup OTP", "updateSignupOtp", error as Error);
    }
  }

  async sendSignupOtpEmail(email: string, otp: string): Promise<void> {
    try {
      // TODO: Implement email service for OTP
      console.log(`Sending OTP ${otp} to ${email}`);
    } catch (error) {
      throw new RepositoryError("Failed to send signup OTP email", "sendSignupOtpEmail", error as Error);
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