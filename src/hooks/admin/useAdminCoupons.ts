import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminCouponsService } from '../../services/admin/adminCouponsService';
import { toast } from 'react-hot-toast';

// Main hook for fetching coupons
export const useAdminCoupons = () => {
  return useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => adminCouponsService.getCoupons(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Create coupon mutation
export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => adminCouponsService.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success('Coupon created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Update coupon mutation
export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ couponId, data }: { couponId: string; data: any }) =>
      adminCouponsService.updateCoupon(couponId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success('Coupon updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Delete coupon mutation
export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (couponId: string) => adminCouponsService.deleteCoupon(couponId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success('Coupon deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Toggle coupon status mutation
export const useToggleCouponStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ couponId, active }: { couponId: string; active: boolean }) =>
      adminCouponsService.toggleCouponStatus(couponId, active),
    onSuccess: (_, { active }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success(`Coupon ${active ? 'activated' : 'deactivated'} successfully!`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Bulk update status mutation
export const useBulkUpdateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ couponIds, active }: { couponIds: string[]; active: boolean }) =>
      adminCouponsService.bulkUpdateStatus(couponIds, { active }),
    onSuccess: (data: { modifiedCount: number }, { active }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success(`${data.modifiedCount} coupons ${active ? 'activated' : 'deactivated'} successfully!`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Bulk delete mutation
export const useBulkDeleteCoupons = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (couponIds: string[]) => adminCouponsService.bulkDeleteCoupons(couponIds),
    onSuccess: (data: { deletedCount: number }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success(`${data.deletedCount} coupons deleted successfully!`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Export coupons mutation
export const useExportCoupons = () => {
  return useMutation({
    mutationFn: (filters: { statusFilter?: string; searchTerm?: string }) => 
      adminCouponsService.exportCoupons(filters),
    onSuccess: (blob: Blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `coupons-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Coupons exported successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};