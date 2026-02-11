import { useQuery } from "@tanstack/react-query";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useGlobalFilterStore } from "@/stores/globalFilterStore";
import { useUserUIStore } from "@/stores/admin/userStore";
import { adminUsersService } from "@/services/admin/adminUsersService";
import type { UserDetails, UserStats } from "@/lib/domain/admin/users/IAdminUsersRepository";
import type { AdminUser } from "@/lib/domain/admin/users/IAdminUsersRepository";
import { PaginationResult } from "@/lib/domain/shared/types";

export const useAdminUsers = () => {
  const { admin, isLoading: authLoading } = useAuthGuard();
  const period = useGlobalFilterStore((s) => s.period);
  const currentPage = useUserUIStore((s) => s.currentPage);
  
  return useQuery<PaginationResult<AdminUser>>({
    queryKey: ["admin-users", period, currentPage],
    queryFn: () => adminUsersService.getUsers({ period, page: currentPage, limit: 20 }),
    enabled: !!admin && !authLoading,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useAdminUserStats = () => {
  const { admin, isLoading: authLoading } = useAuthGuard();
  const period = useGlobalFilterStore(s => s.period);
  
  return useQuery<UserStats>({
    queryKey: ["admin-user-stats", period],
    queryFn: () => adminUsersService.getUserStats(period),
    enabled: !!admin && !authLoading,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useAdminUser = (userId: string) => {
  const { admin, isLoading: authLoading } = useAuthGuard();
  
  return useQuery<UserDetails>({
    queryKey: ["admin-user", userId],
    queryFn: () => adminUsersService.getUserById(userId),
    enabled: !!admin && !authLoading && !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
