import { z } from "zod";

export const SellerProfileQuerySchema = z.object({
  action: z.enum(['profile', 'stats', 'documents', 'password', 'verification']).optional(),
});

export const UpdateProfileSchema = z.object({
  businessName: z.string()
    .min(1, "Business name is required")
    .max(200, "Business name must be less than 200 characters")
    .optional(),
  contactPerson: z.string()
    .min(1, "Contact person is required")
    .max(100, "Contact person name must be less than 100 characters")
    .optional(),
  phone: z.string()
    .min(10, "Phone number must be at least 10 characters")
    .max(15, "Phone number must be less than 15 characters")
    .regex(/^[+]?[\d\s\-\(\)]+$/, "Invalid phone number format")
    .optional(),
  address: z.string()
    .min(1, "Address is required")
    .max(500, "Address must be less than 500 characters")
    .optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(6, "New password must be at least 6 characters")
    .max(128, "New password must be less than 128 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
});

export const DocumentUploadSchema = z.object({
  type: z.enum(['businessLicense', 'taxCertificate', 'identityProof', 'addressProof']),
  file: z.any().refine((file) => {
    if (!file) return false;
    if (typeof file === 'object' && file.size && file.type) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) return false;
      // Check file type (images and PDFs only)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      return allowedTypes.includes(file.type);
    }
    return false;
  }, {
    message: "File must be an image (JPEG, PNG) or PDF, and less than 5MB"
  }),
});

export const VerificationRequestSchema = z.object({
  // No additional fields needed for verification request
});

// Response schemas for better type safety
export const SellerProfileResponseSchema = z.object({
  id: z.string(),
  businessName: z.string(),
  contactPerson: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.string(),
  verified: z.boolean(),
  commission: z.number(),
  createdAt: z.date(),
  totalProducts: z.number(),
  totalSales: z.number(),
  rating: z.number(),
});

export const ProfileStatsResponseSchema = z.object({
  profile: z.object({
    businessName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    status: z.string(),
    verified: z.boolean(),
    joinedAt: z.date(),
  }),
  performance: z.object({
    totalProducts: z.number(),
    activeProducts: z.number(),
    totalOrders: z.number(),
    completedOrders: z.number(),
    totalRevenue: z.number(),
    monthlyRevenue: z.number(),
    averageRating: z.number(),
    totalReviews: z.number(),
    monthlyOrders: z.number(),
  }),
  metrics: z.object({
    conversionRate: z.number(),
    averageOrderValue: z.number(),
    productPerformance: z.number(),
  }),
});

export type SellerProfileQueryRequest = z.infer<typeof SellerProfileQuerySchema>;
export type UpdateProfileRequest = z.infer<typeof UpdateProfileSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordSchema>;
export type DocumentUploadRequest = z.infer<typeof DocumentUploadSchema>;
export type VerificationRequestRequest = z.infer<typeof VerificationRequestSchema>;
export type SellerProfileResponse = z.infer<typeof SellerProfileResponseSchema>;
export type ProfileStatsResponse = z.infer<typeof ProfileStatsResponseSchema>;