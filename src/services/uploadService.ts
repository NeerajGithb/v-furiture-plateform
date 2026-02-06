import { BasePrivateService } from "./baseService";

interface UploadResponse {
  url: string;
  publicId: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
}

interface Base64UploadRequest {
  image: string;
  folder?: string;
}

interface DeleteRequest {
  publicId: string;
}

class UploadService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  // Upload file using FormData
  async uploadFile(
    file: File,
    folder: string = "uploads",
    onProgress?: (progress: number) => void,
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const response = await this.upload<UploadResponse>("/upload", formData, {
      onProgress,
    });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to upload file.",
      );
    }
  }

  // Upload base64 image
  async uploadBase64(data: Base64UploadRequest): Promise<UploadResponse> {
    const response = await this.post<UploadResponse>("/upload", { action: "base64", ...data });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to upload image.",
      );
    }
  }

  // Delete uploaded file
  async deleteFile(data: DeleteRequest): Promise<{ success: boolean }> {
    const response = await this.post<{ success: boolean }>("/upload", { action: "delete", ...data });

    if (response.success) {
      return response.data!;
    } else {
      throw new Error(
        response.error?.message || "Failed to delete file.",
      );
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(
    files: File[],
    folder: string = "uploads",
    onProgress?: (progress: number) => void,
  ): Promise<UploadResponse[]> {
    const uploadPromises = files.map((file) =>
      this.uploadFile(file, folder, onProgress)
    );

    try {
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to upload multiple files.",
      );
    }
  }
}

// Export singleton instance
export const uploadService = new UploadService();