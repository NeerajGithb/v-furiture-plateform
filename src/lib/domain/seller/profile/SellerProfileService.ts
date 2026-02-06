import { SellerProfileRepository, UpdateProfileData, ChangePasswordData, DocumentUploadData, SellerProfile, ProfileStats, DocumentInfo, VerificationStatus, sellerProfileRepository } from "./SellerProfileRepository";
import { 
  UpdateProfileSchema, 
  ChangePasswordSchema, 
  DocumentUploadSchema,
  UpdateProfileRequest,
  ChangePasswordRequest,
  DocumentUploadRequest
} from "./SellerProfileSchemas";
import { ValidationError } from "../../shared/DomainError";

export class ProfileValidationError extends ValidationError {
  readonly code = "PROFILE_VALIDATION_ERROR";
  constructor(message: string, public readonly field?: string) {
    super(message);
  }
}

export class SellerProfileService {
  constructor(private repository: SellerProfileRepository) {}

  async getProfile(sellerId: string): Promise<SellerProfile> {
    return await this.repository.findById(sellerId);
  }

  async updateProfile(sellerId: string, data: UpdateProfileRequest): Promise<SellerProfile> {
    // Validate input data
    const validationResult = UpdateProfileSchema.safeParse(data);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      throw new ProfileValidationError(firstError.message, firstError.path[0] as string);
    }

    return await this.repository.update(sellerId, validationResult.data);
  }

  async changePassword(sellerId: string, data: ChangePasswordRequest): Promise<boolean> {
    // Validate input data
    const validationResult = ChangePasswordSchema.safeParse(data);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      throw new ProfileValidationError(firstError.message, firstError.path[0] as string);
    }

    return await this.repository.changePassword(sellerId, validationResult.data);
  }

  /**
   * Save document info after frontend upload
   */
  async saveDocumentInfo(
    sellerId: string, 
    documentType: 'businessLicense' | 'taxCertificate' | 'identityProof' | 'addressProof',
    url: string,
    publicId: string
  ): Promise<DocumentInfo> {
    const uploadData: DocumentUploadData = {
      type: documentType,
      url,
      publicId,
    };

    return await this.repository.uploadDocument(sellerId, uploadData);
  }

  /**
   * Delete a document (removes from database only - frontend should handle Cloudinary deletion via /api/upload)
   */
  async deleteDocument(sellerId: string, documentType: string): Promise<boolean> {
    return await this.repository.deleteDocument(sellerId, documentType);
  }

  async requestVerification(sellerId: string): Promise<VerificationStatus> {
    return await this.repository.requestVerification(sellerId);
  }

  async getProfileStats(sellerId: string): Promise<ProfileStats> {
    return await this.repository.getProfileStats(sellerId);
  }
}

// Create and export service instance
export const sellerProfileService = new SellerProfileService(sellerProfileRepository);