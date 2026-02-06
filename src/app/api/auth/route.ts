import { NextRequest } from "next/server";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { authService } from "@/lib/domain/auth/AuthService";
import {
  SellerLoginSchema,
  SellerRegisterSchema,
  AdminLoginSchema,
  SendResetCodeSchema,
  VerifyResetCodeSchema,
  ResetPasswordSchema,
} from "@/lib/domain/auth/AuthSchemas";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";
import {
  setSellerAuthCookies,
  setAdminAuthCookies,
  clearSellerAuthCookies,
  clearAdminAuthCookies,
} from "@/lib/middleware/authUtils";

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIP = req.headers.get("x-real-ip");
  return forwarded?.split(",")[0] || realIP || "unknown";
}

export const POST = withDB(
  withRouteErrorHandling(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const userType = searchParams.get("userType") as 'seller' | 'admin' || 'seller';

    const ipAddress = getClientIP(request);
    const userAgent = request.headers.get("user-agent") || "unknown";
    const body = await request.json();

    switch (action) {
      case "seller-login": {
        const validatedData = SellerLoginSchema.parse(body);
        const result = await authService.sellerLogin(
          validatedData,
          ipAddress,
          userAgent,
        );

        const response = ApiResponseBuilder.success({
          seller: result.seller,
        }, { message: result.message });

        setSellerAuthCookies(response, result.tokens.accessToken, result.tokens.refreshToken);
        return response;
      }

      case "admin-login": {
        const validatedData = AdminLoginSchema.parse(body);
        const result = await authService.adminLogin(
          validatedData,
          ipAddress,
          userAgent,
        );

        const response = ApiResponseBuilder.success({
          admin: result.admin,
        }, { message: result.message });

        setAdminAuthCookies(response, result.tokens.accessToken, result.tokens.refreshToken);
        return response;
      }

      case "seller-register": {
        const validatedData = SellerRegisterSchema.parse(body);
        const result = await authService.sellerRegister(
          validatedData,
          ipAddress,
          userAgent,
        );

        return ApiResponseBuilder.created(result);
      }

      // Multi-step seller signup
      case "seller-signup-step1": {
        // Step 1: Email and password validation, send OTP
        const { email, password } = body;
        const result = await authService.sellerSignupStep1({ email, password }, ipAddress);
        return ApiResponseBuilder.success(result);
      }

      case "seller-verify-otp": {
        // Verify OTP for signup
        const { email, otp } = body;
        const result = await authService.verifySignupOtp({ email, otp });
        return ApiResponseBuilder.success(result);
      }

      case "seller-signup-step2": {
        // Step 2: Complete registration with business info
        const validatedData = SellerRegisterSchema.parse(body);
        const result = await authService.sellerSignupStep2(validatedData, ipAddress, userAgent);
        return ApiResponseBuilder.created(result);
      }

      case "seller-resend-otp": {
        // Resend OTP for signup
        const { email } = body;
        const result = await authService.resendSignupOtp({ email }, ipAddress);
        return ApiResponseBuilder.success(result);
      }

      // Password reset flow
      case "send-reset-code": {
        const validatedData = SendResetCodeSchema.parse(body);
        const result = await authService.sendResetCode(validatedData);
        return ApiResponseBuilder.success(result);
      }

      case "verify-reset-code": {
        const validatedData = VerifyResetCodeSchema.parse(body);
        const result = await authService.verifyResetCode(validatedData);
        return ApiResponseBuilder.success(result);
      }

      case "reset-password": {
        const validatedData = ResetPasswordSchema.parse(body);
        const result = await authService.resetPassword(validatedData);
        return ApiResponseBuilder.success(result);
      }

      case "logout": {
        const response = ApiResponseBuilder.success({
          success: true,
        }, { message: "Logged out successfully" });

        if (userType === 'seller') {
          clearSellerAuthCookies(response);
        } else {
          clearAdminAuthCookies(response);
        }
        
        return response;
      }

      default:
        return ApiResponseBuilder.badRequest("Invalid action parameter");
    }
  }),
);