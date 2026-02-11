import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { sellerProfileService } from "@/services/seller/sellerProfileService";
import { 
  UpdateProfileRequest,
  ChangePasswordRequest
} from "@/types/seller/profile";

export const useSellerProfile = () => {
  const { seller, isLoading: authLoading } = useAuthGuard();
  
  return useQuery({
    queryKey: ["seller-profile"],
    queryFn: () => sellerProfileService.getProfile(),
    enabled: !!seller && !authLoading,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useSellerProfileStats = () => {
  const { seller, isLoading: authLoading } = useAuthGuard();
  
  return useQuery({
    queryKey: ["seller-profile-stats"],
    queryFn: () => sellerProfileService.getProfileStats(),
    enabled: !!seller && !authLoading,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useUpdateSellerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => sellerProfileService.updateProfile(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["seller-profile"], updatedProfile);
      queryClient.invalidateQueries({ queryKey: ["seller-profile"] });
      toast.success("Profile updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useChangeSellerPassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => sellerProfileService.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useSaveDocumentInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ type, url, publicId }: { type: string; url: string; publicId: string }) =>
      sellerProfileService.saveDocumentInfo(type, url, publicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-profile"] });
      toast.success("Document uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useRequestVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => sellerProfileService.requestVerification(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-profile"] });
      toast.success("Verification request submitted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentType: string) => sellerProfileService.deleteDocument(documentType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-profile"] });
      toast.success("Document deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};