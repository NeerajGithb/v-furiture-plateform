import { z } from "zod";

// File Upload Schema (for FormData)
export const FileUploadSchema = z.object({
  file: z.any().refine((file) => file instanceof File || file instanceof Blob, {
    message: "File must be a valid File or Blob object",
  }),
  folder: z.string().optional().default("uploads"),
  publicId: z.string().optional(),
  resourceType: z.enum(["image", "video", "raw", "auto"]).optional(),
});

// Base64 Upload Schema (for JSON)
export const Base64UploadSchema = z.object({
  image: z.string().min(1, "Image data is required"),
  folder: z.string().min(1, "Folder is required"),
  publicId: z.string().optional(),
  resourceType: z.enum(["image", "video", "raw", "auto"]).optional(),
});

// Delete Schema
export const DeleteSchema = z.object({
  action: z.literal("delete"),
  publicId: z.string().min(1, "Public ID is required"),
});

// Upload Response Schema
export const UploadResponseSchema = z.object({
  url: z.string().url("Invalid URL"),
  publicId: z.string().min(1, "Public ID is required"),
});

// Type exports
export type FileUploadRequest = z.infer<typeof FileUploadSchema>;
export type Base64UploadRequest = z.infer<typeof Base64UploadSchema>;
export type DeleteRequest = z.infer<typeof DeleteSchema>;
export type UploadResponse = z.infer<typeof UploadResponseSchema>;