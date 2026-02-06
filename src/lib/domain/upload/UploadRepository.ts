import { IUploadRepository } from "./IUploadRepository";
import { RepositoryError } from "../shared/InfrastructureError";
import {
  FileUploadRequest,
  Base64UploadRequest,
  DeleteRequest,
  UploadResponse,
} from "./UploadSchemas";
import { CloudinaryUploadError, FileDeleteError } from "./UploadErrors";
import cloudinary from "@/lib/upload/cloudinary";

export class UploadRepository implements IUploadRepository {
  // Upload file to Cloudinary
  async uploadFile(data: FileUploadRequest): Promise<UploadResponse> {
    try {
      // Convert Blob/File to Node Buffer
      const arrayBuffer = await (data.file as Blob).arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Build upload options
      const uploadOptions: any = {
        folder: data.folder,
        overwrite: true,
        invalidate: true,
      };

      if (data.publicId) {
        uploadOptions.public_id = data.publicId;
      }

      if (data.resourceType) {
        uploadOptions.resource_type = data.resourceType;
      } else {
        // Auto-detect resource type based on file type
        const file = data.file as File;
        uploadOptions.resource_type = file.type === 'application/pdf' ? 'raw' : 'image';
      }

      // Upload to Cloudinary using upload_stream
      const result = await new Promise<{
        secure_url: string;
        public_id: string;
      }>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(uploadOptions, (error, result) => {
            if (error) {
              reject(new CloudinaryUploadError(error.message));
            } else if (!result) {
              reject(new CloudinaryUploadError("No result from Cloudinary"));
            } else {
              resolve(result as { secure_url: string; public_id: string });
            }
          })
          .end(buffer);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      if (error instanceof CloudinaryUploadError) {
        throw error;
      }
      throw new RepositoryError("Failed to upload file", "uploadFile", error as Error);
    }
  }

  // Upload base64 image to Cloudinary
  async uploadBase64(data: Base64UploadRequest): Promise<UploadResponse> {
    try {
      // Build upload options
      const uploadOptions: any = {
        folder: data.folder,
        overwrite: true,
        invalidate: true,
      };

      if (data.publicId) {
        uploadOptions.public_id = data.publicId;
      }

      if (data.resourceType) {
        uploadOptions.resource_type = data.resourceType;
      }

      const result = await cloudinary.uploader.upload(data.image, uploadOptions);

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      throw new RepositoryError(
        "Failed to upload base64 image",
        "uploadBase64",
        error as Error,
      );
    }
  }

  // Delete file from Cloudinary
  async deleteFile(data: DeleteRequest): Promise<boolean> {
    try {
      await cloudinary.uploader.destroy(data.publicId);
      return true;
    } catch (error) {
      throw new FileDeleteError(
        `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}