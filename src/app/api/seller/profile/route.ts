import { NextRequest } from 'next/server';
import { withSellerAuth, AuthenticatedSeller } from '@/lib/middleware/auth';
import { withDB } from '@/lib/middleware/dbConnection';
import { withRouteErrorHandling } from '@/lib/middleware/errorHandler';
import { sellerProfileService } from '@/lib/domain/seller/profile/SellerProfileService';
import { 
  SellerProfileQuerySchema, 
  UpdateProfileSchema,
  ChangePasswordSchema
} from '@/lib/domain/seller/profile/SellerProfileSchemas';
import { ApiResponseBuilder } from '@/lib/utils/apiResponse';

export const GET = withSellerAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, seller: AuthenticatedSeller) => {
        const { searchParams } = new URL(request.url);
        const queryParams = Object.fromEntries(searchParams.entries());
        
        const validatedQuery = SellerProfileQuerySchema.parse(queryParams);
        const { action } = validatedQuery;

        // Handle different actions
        switch (action) {
          case 'stats':
            const stats = await sellerProfileService.getProfileStats(seller.id);
            return ApiResponseBuilder.success({ stats });

          default:
            // Default profile action
            const profile = await sellerProfileService.getProfile(seller.id);
            return ApiResponseBuilder.success({ seller: profile });
        }
      },
    ),
  ),
);

export const PUT = withSellerAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, seller: AuthenticatedSeller) => {
        const body = await request.json();

        // Check if this is a password change request
        if (body.action === 'password') {
          const validatedData = ChangePasswordSchema.parse(body);
          await sellerProfileService.changePassword(seller.id, validatedData);
          return ApiResponseBuilder.success({}, { message: 'Password changed successfully' });
        }

        // Regular profile update
        const validatedData = UpdateProfileSchema.parse(body);
        const updatedProfile = await sellerProfileService.updateProfile(seller.id, validatedData);
        return ApiResponseBuilder.success({ seller: updatedProfile }, { message: 'Profile updated successfully' });
      },
    ),
  ),
);

export const PATCH = withSellerAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, seller: AuthenticatedSeller) => {
        const body = await request.json();

        // Check if this is a password change request
        if (body.action === 'password') {
          const validatedData = ChangePasswordSchema.parse(body);
          await sellerProfileService.changePassword(seller.id, validatedData);
          return ApiResponseBuilder.success({}, { message: 'Password changed successfully' });
        }

        // Regular profile update (partial update)
        const validatedData = UpdateProfileSchema.partial().parse(body);
        const updatedProfile = await sellerProfileService.updateProfile(seller.id, validatedData);
        return ApiResponseBuilder.success({ seller: updatedProfile }, { message: 'Profile updated successfully' });
      },
    ),
  ),
);

export const POST = withSellerAuth(
  withDB(
    withRouteErrorHandling(
      async (request: NextRequest, seller: AuthenticatedSeller) => {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const body = await request.json();

        switch (action) {
          case 'documents':
            const { type, url, publicId } = body;
            if (!url || !type || !publicId) {
              return ApiResponseBuilder.badRequest('URL, type, and publicId are required');
            }
            const documentResult = await sellerProfileService.saveDocumentInfo(seller.id, type, url, publicId);
            return ApiResponseBuilder.success(documentResult, { message: 'Document uploaded successfully' });

          case 'verification':
            const verificationResult = await sellerProfileService.requestVerification(seller.id);
            return ApiResponseBuilder.success(verificationResult, { message: 'Verification request submitted successfully' });

          case 'deleteDocument':
            const { documentType } = body;
            if (!documentType) {
              return ApiResponseBuilder.badRequest('Document type is required');
            }
            await sellerProfileService.deleteDocument(seller.id, documentType);
            return ApiResponseBuilder.success({}, { message: 'Document deleted successfully' });

          default:
            return ApiResponseBuilder.badRequest('Invalid action specified');
        }
      },
    ),
  ),
);
