import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { adminUsersService } from "@/services/admin/adminUsersService";
import { AdminUsersQuery } from "@/types/user";

export const useAdminUsers = (params: AdminUsersQuery = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => adminUsersService.getUsers(params),
    enabled: enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useAdminUserStats = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["admin-user-stats"],
    queryFn: () => adminUsersService.getUserStats(),
    enabled: enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useAdminUser = (userId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => adminUsersService.getUserById(userId),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status, reason }: { userId: string; status: string; reason?: string }) =>
      adminUsersService.updateUserStatus(userId, status, reason),
    onSuccess: (updatedUser, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.setQueryData(["admin-user", userId], updatedUser);
      queryClient.invalidateQueries({ queryKey: ["admin-user-stats"] });
      toast.success("User status updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUserOrderHistory = (userId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["admin-user-orders", userId],
    queryFn: () => adminUsersService.getUserOrderHistory(userId),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useAddUserNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, note }: { userId: string; note: string }) =>
      adminUsersService.addUserNote(userId, note),
    onSuccess: (updatedUser, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.setQueryData(["admin-user", userId], updatedUser);
      toast.success("Note added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};