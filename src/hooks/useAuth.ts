import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

interface SellerLoginData {
  email: string;
  password: string;
}

interface AdminLoginData {
  email: string;
  password: string;
}

interface ResetCodeData {
  email: string;
  userType: 'seller' | 'admin';
}

interface VerifyCodeData {
  email: string;
  code: string;
  userType: 'seller' | 'admin';
}

interface ResetPasswordData {
  email: string;
  newPassword: string;
  userType: 'seller' | 'admin';
}

interface SellerSignupStep1Data {
  email: string;
  password: string;
}

interface VerifySignupOtpData {
  email: string;
  otp: string;
}

interface SellerSignupStep2Data {
  email: string;
  password: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  address: string;
  businessType: string;
  gstNumber?: string;
}

interface ResendSignupOtpData {
  email: string;
}

// Login hooks
export const useSellerLogin = () => {
  const router = useRouter();
  const { setSeller } = useAuthStore();

  return useMutation({
    mutationFn: (data: SellerLoginData) => authService.sellerLogin(data),
    onSuccess: (data) => {
      setSeller(data.seller as any);
      router.push("/seller/dashboard");
    },
    onError: (error: Error) => {
      // Let the UI component handle error display
    },
  });
};

export const useAdminLogin = () => {
  const router = useRouter();
  const { setAdmin } = useAuthStore();

  return useMutation({
    mutationFn: (data: AdminLoginData) => authService.adminLogin(data),
    onSuccess: (data) => {
      setAdmin(data.admin as any);
      router.push("/admin/dashboard");
    },
    onError: (error: Error) => {
      // Let the UI component handle error display
    },
  });
};

// Current user fetching hooks
export const useCurrentSeller = (enabled: boolean = true) => {
  const { setSeller, setSellerLoading } = useAuthStore();

  return useQuery({
    queryKey: ['current-seller'],
    queryFn: async () => {
      setSellerLoading(true);
      try {
        const data = await authService.getCurrentSeller();
        setSeller(data as any);
        return data;
      } catch (error) {
        setSeller(null);
        throw error;
      } finally {
        setSellerLoading(false);
      }
    },
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

export const useCurrentAdmin = (enabled: boolean = true) => {
  const { setAdmin, setAdminLoading } = useAuthStore();

  return useQuery({
    queryKey: ['current-admin'],
    queryFn: async () => {
      setAdminLoading(true);
      try {
        const data = await authService.getCurrentAdmin();
        setAdmin(data as any);
        return data;
      } catch (error) {
        setAdmin(null);
        throw error;
      } finally {
        setAdminLoading(false);
      }
    },
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

// Logout hook
export const useAuthLogout = () => {
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userType: 'seller' | 'admin') => authService.logout(userType),
    onSuccess: () => {
      clearAuth();
      // Remove all queries to prevent refetch attempts
      queryClient.removeQueries({ queryKey: ['current-seller'] });
      queryClient.removeQueries({ queryKey: ['current-admin'] });
      queryClient.clear(); // Clear all queries
      router.push('/');
    },
    onError: (error: Error) => {
      clearAuth();
      // Remove all queries even on error
      queryClient.removeQueries({ queryKey: ['current-seller'] });
      queryClient.removeQueries({ queryKey: ['current-admin'] });
      queryClient.clear();
      router.push('/');
      toast.error(error.message);
    },
  });
};

export const useSendResetCode = () => {
  return useMutation({
    mutationFn: (data: ResetCodeData) => authService.sendResetCode(data),
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useVerifyResetCode = () => {
  return useMutation({
    mutationFn: (data: VerifyCodeData) => authService.verifyResetCode(data),
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useResetPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: ResetPasswordData) => authService.resetPassword(data),
    onSuccess: () => {
      // Redirect to login page
      router.push("/auth/login");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Multi-step seller signup hooks
export const useSellerSignupStep1 = () => {
  return useMutation({
    mutationFn: (data: SellerSignupStep1Data) => authService.sellerSignupStep1(data),
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useVerifySignupOtp = () => {
  return useMutation({
    mutationFn: (data: VerifySignupOtpData) => authService.verifySignupOtp(data),
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useSellerSignupStep2 = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: SellerSignupStep2Data) => authService.sellerSignupStep2(data),
    onSuccess: () => {
      // Redirect to login page after successful registration
      router.push("/login/seller");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useResendSignupOtp = () => {
  return useMutation({
    mutationFn: (data: ResendSignupOtpData) => authService.resendSignupOtp(data),
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};