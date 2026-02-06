// Frontend auth service - makes HTTP calls to API endpoints
import { BasePrivateService } from "./baseService";
import toast from "react-hot-toast";

// Request interfaces
interface SellerLoginRequest {
  email: string;
  password: string;
}

interface AdminLoginRequest {
  email: string;
  password: string;
}

interface SendResetCodeRequest {
  email: string;
  userType: 'seller' | 'admin';
}

interface VerifyResetCodeRequest {
  email: string;
  code: string;
  userType: 'seller' | 'admin';
}

interface ResetPasswordRequest {
  email: string;
  newPassword: string;
  userType: 'seller' | 'admin';
}

interface SellerSignupStep1Request {
  email: string;
  password: string;
}

interface VerifySignupOtpRequest {
  email: string;
  otp: string;
}

interface SellerSignupStep2Request {
  email: string;
  password: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  address: string;
  businessType: string;
  gstNumber?: string;
}

interface ResendSignupOtpRequest {
  email: string;
}

// Response interfaces
interface AuthSeller {
  id: string;
  name: string;
  email: string;
  businessName?: string;
  isVerified: boolean;
}

interface AuthAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface SellerLoginResponse {
  message: string;
  seller: AuthSeller;
}

interface AdminLoginResponse {
  message: string;
  admin: AuthAdmin;
}

interface CodeResponse {
  success: boolean;
  message?: string;
  attemptsRemaining?: number;
}

interface SellerRegisterResponse {
  message: string;
  seller: {
    id: string;
    businessName: string;
    email: string;
    status: string;
  };
}

class AuthService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  // Seller login with email and password
  async sellerLogin(data: SellerLoginRequest): Promise<SellerLoginResponse> {
    const response = await this.post<SellerLoginResponse>("/auth?action=seller-login", data);

    if (response.success) {
      toast.success("Welcome back! Login successful.");
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Login failed. Please try again.",
      );
    }
  }

  // Admin login with email and password
  async adminLogin(data: AdminLoginRequest): Promise<AdminLoginResponse> {
    const response = await this.post<AdminLoginResponse>("/auth?action=admin-login", data);
    if (response.success) {
      toast.success("Welcome back! Admin login successful.");
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Admin login failed. Please try again.",
      );
    }
  }

  // Send password reset code to email
  async sendResetCode(data: SendResetCodeRequest): Promise<CodeResponse> {
    const response = await this.post<CodeResponse>("/auth?action=send-reset-code", data);

    if (response.success) {
      toast.success("Reset code sent! Check your email.");
      return response.data!;
    } else {
      throw new Error(response.error?.message || "Failed to send reset code.");
    }
  }

  // Verify password reset code
  async verifyResetCode(data: VerifyResetCodeRequest): Promise<CodeResponse> {
    const response = await this.post<{ valid: boolean }>("/auth?action=verify-reset-code", data);

    if (response.success && response.data?.valid) {
      toast.success("Code verified! Set your new password.");
      return { success: true };
    } else {
      throw new Error(response.error?.message || "Verification failed.");
    }
  }

  // Reset user password
  async resetPassword(data: ResetPasswordRequest): Promise<CodeResponse> {
    const response = await this.post<CodeResponse>("/auth?action=reset-password", data);

    if (response.success) {
      toast.success("Password reset successful! You can now login.");
      return response.data!;
    } else {
      throw new Error(response.error?.message || "Password reset failed.");
    }
  }

  // Get current seller data
  async getCurrentSeller(): Promise<AuthSeller> {
    const response = await this.get<{ user: AuthSeller }>("/auth/current-user?userType=seller");

    if (response.success) {
      return response.data!.user;
    } else {
      throw new Error(response.error?.message || "Failed to fetch seller data");
    }
  }

  // Get current admin data
  async getCurrentAdmin(): Promise<AuthAdmin> {
    const response = await this.get<{ user: AuthAdmin }>("/auth/current-user?userType=admin");

    if (response.success) {
      return response.data!.user;
    } else {
      throw new Error(response.error?.message || "Failed to fetch admin data");
    }
  }

  // Logout current user
  async logout(userType: 'seller' | 'admin' = 'seller'): Promise<CodeResponse> {
    const response = await this.post<CodeResponse>(`/auth?action=logout&userType=${userType}`, {});

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(response.error?.message || "Logout failed.");
    }
  }

  // Multi-step seller signup - Step 1: Send OTP
  async sellerSignupStep1(data: SellerSignupStep1Request): Promise<CodeResponse> {
    const response = await this.post<CodeResponse>("/auth?action=seller-signup-step1", data);

    if (response.success) {
      toast.success("Verification code sent! Check your email.");
      return response.data!;
    } else {
      throw new Error(response.error?.message || "Failed to send verification code.");
    }
  }

  // Verify signup OTP
  async verifySignupOtp(data: VerifySignupOtpRequest): Promise<CodeResponse> {
    const response = await this.post<CodeResponse>("/auth?action=seller-verify-otp", data);

    if (response.success) {
      toast.success("Email verified successfully!");
      return response.data!;
    } else {
      throw new Error(response.error?.message || "Invalid verification code.");
    }
  }

  // Multi-step seller signup - Step 2: Complete registration
  async sellerSignupStep2(data: SellerSignupStep2Request): Promise<SellerRegisterResponse> {
    const response = await this.post<SellerRegisterResponse>("/auth?action=seller-signup-step2", data);

    if (response.success) {
      toast.success("Registration successful! Your account is pending approval.");
      return response.data!;
    } else {
      throw new Error(response.error?.message || "Registration failed.");
    }
  }

  // Resend signup OTP
  async resendSignupOtp(data: ResendSignupOtpRequest): Promise<CodeResponse> {
    const response = await this.post<CodeResponse>("/auth?action=seller-resend-otp", data);

    if (response.success) {
      toast.success("New verification code sent!");
      return response.data!;
    } else {
      throw new Error(response.error?.message || "Failed to resend verification code.");
    }
  }
}

// Export singleton instance
export const authService = new AuthService();