'use client';

import { useState } from 'react';
import {
  useSellerInventory,
  useSellerInventoryStats,
  useUpdateStock,
  useSetReorderLevel,
  useLowStockAlerts,
  useResolveLowStockAlert,
} from '@/hooks/seller/useSellerInventory';
import { useInventoryStore } from '@/stores/seller/inventoryStore';
import { StockUpdateType } from '@/types/seller/inventory';
import { LoaderGuard } from '@/components/ui/LoaderGuard';
import { Pagination } from '@/components/ui/Pagination';
import PageHeader from '@/components/PageHeader';
import InventoryStats from './components/InventoryStats';
import InventoryTable from './components/InventoryTable';
import { AlertCircle, Check } from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Inventory' },
  { id: 'alerts', label: 'Low Stock Alerts' },
  { id: 'history', label: 'Stock History' },
] as const;

export default function SellerInventoryPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'history'>('overview');

  const currentPage = useInventoryStore(s => s.currentPage);
  const setCurrentPage = useInventoryStore(s => s.setCurrentPage);

  const { data: inventoryData, isPending, error, refetch, isFetching } = useSellerInventory();
  const { data: stats } = useSellerInventoryStats();
  const { data: alertsData } = useLowStockAlerts();

  const updateStock = useUpdateStock();
  const setReorderLevel = useSetReorderLevel();
  const resolveLowStockAlert = useResolveLowStockAlert();

  const inventory = inventoryData?.inventory || [];
  const pagination = inventoryData?.pagination;
  const alerts = alertsData?.alerts || [];

  const handleStockUpdate = (productId: string, quantity: number, type: StockUpdateType = 'set', reason?: string) =>
    updateStock.mutate({ productId, stockData: { quantity, type, reason } });

  const handleReorderLevelUpdate = (productId: string, reorderLevel: number) =>
    setReorderLevel.mutate({ productId, reorderLevel });

  const tabCounts: Record<string, number | undefined> = {
    overview: pagination?.total,
    alerts: alerts.length,
    history: undefined,
  };

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Manage your product stock levels"
        onRefresh={refetch}
        isRefreshing={isFetching}
      />

      <LoaderGuard
        isLoading={isPending}
        error={error}
        isEmpty={!inventoryData || (inventoryData.pagination?.total || 0) === 0}
        emptyMessage="No inventory items"
      >
        {() => (
          <div className="space-y-5">
            <InventoryStats stats={stats} />

            {/* Tab container */}
            <div className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
              {/* Tab bar */}
              <div className="flex border-b border-[#E5E7EB] bg-[#F8F9FA]">
                {TABS.map(tab => {
                  const count = tabCounts[tab.id];
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 text-[12px] font-semibold border-b-2 transition-colors ${isActive
                          ? 'border-[#111111] text-[#111111] bg-white'
                          : 'border-transparent text-[#9CA3AF] hover:text-[#555555] hover:bg-white/50'
                        }`}
                    >
                      {tab.label}
                      {count !== undefined && (
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded tabular-nums ${isActive ? 'bg-[#111111] text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
                          }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab content */}
              <div className="p-5">
                {activeTab === 'overview' && (
                  <div className="space-y-5">
                    <InventoryTable
                      inventory={inventory}
                      onStockUpdate={handleStockUpdate}
                      onReorderLevelUpdate={handleReorderLevelUpdate}
                      updateStock={updateStock}
                      setReorderLevel={setReorderLevel}
                      getStockBadge={() => ''}
                    />
                    {pagination && pagination.pages > 1 && (
                      <Pagination
                        pagination={{
                          page: pagination.page,
                          limit: pagination.limit,
                          total: pagination.total,
                          totalPages: pagination.pages,
                          hasNext: currentPage < pagination.pages,
                          hasPrev: currentPage > 1,
                        }}
                        onPageChange={setCurrentPage}
                      />
                    )}
                  </div>
                )}

                {activeTab === 'alerts' && (
                  <div className="space-y-4">
                    {alerts.length > 0 ? (
                      <>
                        <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">{alerts.length} Alert{alerts.length !== 1 ? 's' : ''}</p>
                        <div className="space-y-2.5">
                          {alerts.map(alert => (
                            <div key={alert.id} className="flex items-center justify-between px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white border border-amber-200 rounded-md flex items-center justify-center">
                                  <AlertCircle className="w-4 h-4 text-amber-500" />
                                </div>
                                <div>
                                  <p className="text-[13px] font-semibold text-[#111111]">{alert.productId.name}</p>
                                  <p className="text-[11px] text-amber-700">
                                    Stock: <span className="font-bold">{alert.currentStock}</span> · Reorder level: {alert.reorderLevel}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => resolveLowStockAlert.mutate(alert.id)}
                                disabled={resolveLowStockAlert.isPending}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#111111] text-white text-[12px] font-medium rounded-md hover:bg-[#222222] disabled:opacity-40 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                                {resolveLowStockAlert.isPending ? 'Resolving…' : 'Resolve'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-10">
                        <div className="w-10 h-10 bg-[#F3F4F6] rounded-full flex items-center justify-center mx-auto mb-3">
                          <Check className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-[13px] text-[#9CA3AF]">No low stock alerts — all good!</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="text-center py-12">
                    <p className="text-[13px] text-[#9CA3AF]">Stock history is coming soon.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </LoaderGuard>
    </>
  );
}
