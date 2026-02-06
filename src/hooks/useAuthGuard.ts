import { useAuthStore } from '@/stores/authStore';
import { useCurrentSeller, useCurrentAdmin, useAuthLogout } from './useAuth';

export const useAuthGuard = () => {
  const { seller, admin, sellerLoading, adminLoading } = useAuthStore();
  const logoutMutation = useAuthLogout();

  // Determine which user type to fetch based on current path
  const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  const isSellerPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/seller');

  // Fetch current user data based on path
  const { refetch: refetchSeller } = useCurrentSeller(isSellerPath && !seller);
  const { refetch: refetchAdmin } = useCurrentAdmin(isAdminPath && !admin);

  const handleLogout = async () => {
    if (admin) {
      logoutMutation.mutate('admin');
    } else if (seller) {
      logoutMutation.mutate('seller');
    }
  };

  const refetch = async () => {
    if (isAdminPath) {
      await refetchAdmin();
    } else if (isSellerPath) {
      await refetchSeller();
    }
  };

  return {
    seller,
    admin,
    isLoading: sellerLoading || adminLoading || logoutMutation.isPending,
    logout: handleLogout,
    refetch,
  };
};