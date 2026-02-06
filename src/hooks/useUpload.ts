import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { uploadService } from "@/services/uploadService";

interface UploadFileOptions {
  file: File;
  folder?: string;
  onProgress?: (progress: number) => void;
}

interface UploadBase64Options {
  image: string;
  folder?: string;
}

interface DeleteFileOptions {
  publicId: string;
}

export const useUploadFile = () => {
  return useMutation({
    mutationFn: ({ file, folder = "uploads", onProgress }: UploadFileOptions) =>
      uploadService.uploadFile(file, folder, onProgress),
    onSuccess: () => {
      toast.success("File uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUploadBase64 = () => {
  return useMutation({
    mutationFn: (data: UploadBase64Options) => uploadService.uploadBase64(data),
    onSuccess: () => {
      toast.success("Image uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteFile = () => {
  return useMutation({
    mutationFn: (data: DeleteFileOptions) => uploadService.deleteFile(data),
    onSuccess: () => {
      toast.success("File deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUploadMultipleFiles = () => {
  return useMutation({
    mutationFn: ({ files, folder = "uploads", onProgress }: { files: File[]; folder?: string; onProgress?: (progress: number) => void }) =>
      uploadService.uploadMultipleFiles(files, folder, onProgress),
    onSuccess: () => {
      toast.success("Files uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};