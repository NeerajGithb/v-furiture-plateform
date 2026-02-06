import { z } from "zod";

// Password validation schema with all strength requirements
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password must not exceed 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    "Password must contain at least one special character",
  );

// Seller Login schema
export const SellerLoginSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

// Seller Register schema
export const SellerRegisterSchema = z.object({
  businessName: z.string().min(1, "Business name is required").max(200).trim(),
  contactPerson: z.string().min(1, "Contact person is required").max(100).trim(),
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  password: passwordSchema,
  phone: z.string().optional(),
  address: z.string().optional(),
  businessType: z.enum(['manufacturer', 'wholesaler', 'retailer', 'distributor', 'other']).optional(),
  gstNumber: z.string().optional(),
});

// Admin Login schema
export const AdminLoginSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

// Send reset code schema
export const SendResetCodeSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  userType: z.enum(['seller', 'admin']),
});

// Verify reset code schema
export const VerifyResetCodeSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  code: z
    .string()
    .length(6, "Code must be 6 digits")
    .regex(/^\d{6}$/, "Code must be numeric"),
  userType: z.enum(['seller', 'admin']),
});

// Reset password schema
export const ResetPasswordSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  newPassword: passwordSchema,
  userType: z.enum(['seller', 'admin']),
});

// Change password schema
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

// Refresh token schema
export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// Type exports
export type SellerLoginRequest = z.infer<typeof SellerLoginSchema>;
export type SellerRegisterRequest = z.infer<typeof SellerRegisterSchema>;
export type AdminLoginRequest = z.infer<typeof AdminLoginSchema>;
export type SendResetCodeRequest = z.infer<typeof SendResetCodeSchema>;
export type VerifyResetCodeRequest = z.infer<typeof VerifyResetCodeSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenSchema>;