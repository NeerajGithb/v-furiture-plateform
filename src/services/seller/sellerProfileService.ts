import { BasePrivateService } from "../baseService";
import { 
  SellerProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ProfileStats
} from "@/types/seller/profile";

class SellerProfileService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  // Get seller profile
  async getProfile(): Promise<SellerProfile> {
    const response = await this.get<{ seller: SellerProfile }>("/seller/profile");

    if (response.success) {
      return response.data!.seller;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch profile.",
      );
    }
  }

  // Get profile statistics
  async getProfileStats(): Promise<ProfileStats> {
    const response = await this.get<{ stats: ProfileStats }>("/seller/profile", { action: "stats" });

    if (response.success) {
      return response.data!.stats;
    } else {
      throw new Error(
        response.error?.message || "Failed to fetch profile statistics.",
      );
    }
  }

  // Update seller profile
  async updateProfile(data: UpdateProfileRequest): Promise<SellerProfile> {
    const response = await this.put<{ seller: SellerProfile }>("/seller/profile", data);

    if (response.success) {
      return response.data!.seller;
    } else {
      throw new Error(
        response.error?.message || "Failed to update profile.",
      );
    }
  }

  // Change password
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    const response = await this.patch("/seller/profile", {
      action: "changePassword",
      ...data,
    });

    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to change password.",
      );
    }
  }

  // Save document info (upload document)
  async saveDocumentInfo(type: string, url: string, publicId: string): Promise<any> {
    const response = await this.post("/seller/profile", {
      action: "document",
      type,
      url,
      publicId,
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to save document.",
      );
    }
  }

  // Request verification
  async requestVerification(): Promise<any> {
    const response = await this.post("/seller/profile", {
      action: "verification",
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to request verification.",
      );
    }
  }

  // Delete document
  async deleteDocument(documentType: string): Promise<void> {
    const response = await this.post("/seller/profile", {
      action: "deleteDocument",
      documentType,
    });

    if (!response.success) {
      throw new Error(
        response.error?.message || "Failed to delete document.",
      );
    }
  }
}

// Export singleton instance
export const sellerProfileService = new SellerProfileService();