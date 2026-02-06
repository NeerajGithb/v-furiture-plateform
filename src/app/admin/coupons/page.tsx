'use client';

import { useState, useMemo } from 'react';
import {
  RefreshCw, Download, Plus, Search, Filter,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { useGlobalFilterStore } from '@/stores/globalFilterStore';
import { 
  useAdminCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
  useToggleCouponStatus,
  useBulkUpdateStatus,
  useBulkDeleteCoupons,
  useExportCoupons
} from '@/hooks/admin/useAdminCoupons';
import { AdminCoupon } from '@/types/coupon';
import CouponsOverview from './components/CouponsOverview';
import CouponsTable from './components/CouponsTable';
import CouponFormModal from './components/CouponFormModal';
import CouponsSkeleton from './components/CouponsSkeleton';

export default function AdminCouponsPage() {
  // Local state for UI only
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null);

  // Global filters
  const { 
    search: searchTerm,
    status: statusFilter,
    setSearch: setSearchTerm,
    setStatus: setStatusFilter
  } = useGlobalFilterStore();

  // Data fetching and mutations
  const { data, isLoading, refetch } = useAdminCoupons();
  const createCouponMutation = useCreateCoupon();
  const updateCouponMutation = useUpdateCoupon();
  const deleteCouponMutation = useDeleteCoupon();
  const toggleStatusMutation = useToggleCouponStatus();
  const bulkUpdateStatusMutation = useBulkUpdateStatus();
  const bulkDeleteMutation = useBulkDeleteCoupons();
  const exportMutation = useExportCoupons();

  const allCoupons = data?.coupons || [];
  const stats = data?.stats;

  // Check if any mutation is loading
  const isMutating = createCouponMutation.isPending || 
                    updateCouponMutation.isPending || 
                    deleteCouponMutation.isPending || 
                    toggleStatusMutation.isPending ||
                    bulkUpdateStatusMutation.isPending ||
                    bulkDeleteMutation.isPending ||
                    exportMutation.isPending;

  // Client-side filtering for instant tab switching
  const filteredCoupons = useMemo(() => {
    return allCoupons.filter((coupon: AdminCoupon) => {
      // Tab filter
      let matchesTab = true;
      if (activeTab !== 'all') {
        if (activeTab === 'active') {
          matchesTab = coupon.active && new Date(coupon.expiry) > new Date();
        } else if (activeTab === 'expired') {
          matchesTab = !coupon.active || new Date(coupon.expiry) <= new Date();
        }
      }

      // Status filter
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && coupon.active && new Date(coupon.expiry) > new Date()) ||
        (statusFilter === 'inactive' && !coupon.active) ||
        (statusFilter === 'expired' && new Date(coupon.expiry) <= new Date());

      // Search filter
      const matchesSearch = !searchTerm ||
        coupon.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.description?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesTab && matchesStatus && matchesSearch;
    });
  }, [allCoupons, activeTab, statusFilter, searchTerm]);

  // Event handlers
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedCoupons([]);
  };

  const handleSelectAll = (couponIds: string[]) => {
    if (selectedCoupons.length === couponIds.length) {
      setSelectedCoupons([]);
    } else {
      setSelectedCoupons(couponIds);
    }
  };

  const handleCreateCoupon = () => {
    setEditingCoupon(null);
    setShowCreateModal(true);
  };

  const handleEditCoupon = (coupon: AdminCoupon) => {
    setEditingCoupon(coupon);
    setShowEditModal(true);
  };

  const handleDeleteCoupon = (couponId: string) => {
    const coupon = allCoupons.find((c: AdminCoupon) => c._id === couponId);
    if (confirm(`Are you sure you want to delete "${coupon?.code}"? This action cannot be undone.`)) {
      deleteCouponMutation.mutate(couponId);
    }
  };

  const handleToggleStatus = (couponId: string, active: boolean) => {
    toggleStatusMutation.mutate({ couponId, active });
  };

  const handleFormSubmit = (formData: any) => {
    if (editingCoupon) {
      updateCouponMutation.mutate(
        { couponId: editingCoupon._id, data: formData },
        {
          onSuccess: () => {
            setShowEditModal(false);
            setEditingCoupon(null);
          }
        }
      );
    } else {
      createCouponMutation.mutate(formData, {
        onSuccess: () => {
          setShowCreateModal(false);
        }
      });
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingCoupon(null);
  };

  const handleExport = () => {
    exportMutation.mutate({ statusFilter, searchTerm });
  };

  const handleBulkAction = (action: string) => {
    if (selectedCoupons.length === 0) return;
    
    switch (action) {
      case 'activate':
        bulkUpdateStatusMutation.mutate(
          { couponIds: selectedCoupons, active: true },
          {
            onSuccess: () => setSelectedCoupons([])
          }
        );
        break;
      case 'deactivate':
        bulkUpdateStatusMutation.mutate(
          { couponIds: selectedCoupons, active: false },
          {
            onSuccess: () => setSelectedCoupons([])
          }
        );
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete ${selectedCoupons.length} coupons? This action cannot be undone.`)) {
          bulkDeleteMutation.mutate(selectedCoupons, {
            onSuccess: () => setSelectedCoupons([])
          });
        }
        break;
    }
  };

  return (
    <>
      {isLoading && <CouponsSkeleton />}
      {!isLoading && data && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
              <p className="text-sm text-gray-500 mt-1">Create and manage discount coupons</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => refetch()}
                disabled={isLoading || isMutating}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium text-gray-700"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                disabled={exportMutation.isPending}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium text-gray-700"
              >
                <Download className="w-4 h-4" />
                {exportMutation.isPending ? 'Exporting...' : 'Export'}
              </button>
              <button
                onClick={handleCreateCoupon}
                disabled={isMutating}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                New Coupon
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          {stats && (
            <CouponsOverview
              stats={stats}
              onTabChange={handleTabChange}
              activeTab={activeTab}
            />
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by coupon code or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm placeholder-gray-400"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${showFilters
                    ? 'bg-gray-100 border-gray-300 text-gray-900'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Filter className="w-4 h-4" />
                Status Filter
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm bg-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setSearchTerm('');
                    }}
                    className="w-full px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium text-gray-700"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedCoupons.length > 0 && (
            <div className="bg-gray-50 border-b border-gray-200 p-3 rounded-lg flex items-center justify-between flex-wrap gap-3">
              <p className="text-sm font-medium text-gray-700">
                {selectedCoupons.length} selected
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleBulkAction('activate')}
                  disabled={bulkUpdateStatusMutation.isPending}
                  className="px-3 py-1.5 text-gray-900 hover:text-green-700 hover:bg-green-50 rounded text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Activate
                </button>
                <button 
                  onClick={() => handleBulkAction('deactivate')}
                  disabled={bulkUpdateStatusMutation.isPending}
                  className="px-3 py-1.5 text-gray-900 hover:text-amber-700 hover:bg-amber-50 rounded text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Deactivate
                </button>
                <button 
                  onClick={() => handleBulkAction('delete')}
                  disabled={bulkDeleteMutation.isPending}
                  className="px-3 py-1.5 text-gray-900 hover:text-red-700 hover:bg-red-50 rounded text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
                <div className="h-4 w-px bg-gray-300 mx-1"></div>
                <button
                  onClick={() => setSelectedCoupons([])}
                  className="px-3 py-1.5 text-gray-500 hover:text-gray-900 rounded text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Coupons Table */}
          <CouponsTable
            coupons={filteredCoupons}
            selectedCoupons={selectedCoupons}
            onToggleSelection={(couponId) => {
              setSelectedCoupons(prev => 
                prev.includes(couponId) 
                  ? prev.filter(id => id !== couponId)
                  : [...prev, couponId]
              );
            }}
            onSelectAll={handleSelectAll}
            onEditCoupon={handleEditCoupon}
            onDeleteCoupon={handleDeleteCoupon}
            onToggleStatus={handleToggleStatus}
          />

          {/* Form Modal */}
          <CouponFormModal
            isOpen={showCreateModal || showEditModal}
            onClose={handleCloseModal}
            onSubmit={handleFormSubmit}
            editingCoupon={editingCoupon}
            isLoading={createCouponMutation.isPending || updateCouponMutation.isPending}
          />
        </div>
      )}
    </>
  );
}
