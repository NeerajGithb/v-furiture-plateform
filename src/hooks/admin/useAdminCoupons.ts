import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useGlobalFilterStore } from '@/stores/globalFilterStore';
import { useCouponUIStore } from '@/stores/admin/couponStore';
import { adminCouponsService } from '../../services/admin/adminCouponsService';
import { toast } from 'react-hot-toast';
import type { AdminCoupon, CouponCreateRequest, CouponUpdateRequest } from '@/types/admin/coupons';

export const useAdminCoupons = () => {
  const { admin, isLoading: authLoading } = useAuthGuard();
  const period = useGlobalFilterStore((s) => s.period);
  const currentPage = useCouponUIStore((s) => s.currentPage);
  
  return useQuery({
    queryKey: ['admin-coupons', period, currentPage],
    queryFn: () => adminCouponsService.getCoupons({ period, page: currentPage, limit: 10 }),
    enabled: !!admin && !authLoading,
  });
};

export const useAdminCouponStats = () => {
  const { admin, isLoading: authLoading } = useAuthGuard();
  
  return useQuery({
    queryKey: ['admin-coupon-stats'],
    queryFn: () => adminCouponsService.getCouponStats(),
    enabled: !!admin && !authLoading,
  });
};

// Create coupon mutation
export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CouponCreateRequest) => adminCouponsService.createCoupon(data),
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
    mutationFn: ({ couponId, data }: { couponId: string; data: CouponUpdateRequest }) =>
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