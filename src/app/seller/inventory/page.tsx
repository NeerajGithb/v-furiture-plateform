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
import { AlertCircle } from 'lucide-react';

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

  const handleStockUpdate = (productId: string, quantity: number, type: StockUpdateType = 'set', reason?: string) => {
    updateStock.mutate({
      productId,
      stockData: { quantity, type, reason }
    });
  };

  const handleReorderLevelUpdate = (productId: string, reorderLevel: number) => {
    setReorderLevel.mutate({
      productId,
      reorderLevel
    });
  };

  const handleResolveAlert = (alertId: string) => {
    resolveLowStockAlert.mutate(alertId);
  };

  const getStockBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20';
      case 'low_stock':
        return 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20';
      case 'out_of_stock':
        return 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20';
      case 'discontinued':
        return 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20';
      default:
        return 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20';
    }
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
          <div className="space-y-6 max-w-7xl mx-auto">
            <InventoryStats stats={stats} />

            <div className="bg-white rounded-lg border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Inventory', count: pagination?.total },
                    { id: 'alerts', label: 'Low Stock Alerts', count: alerts.length },
                    { id: 'history', label: 'Stock History', count: null }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === tab.id
                          ? 'border-gray-900 text-gray-900'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                      <span>{tab.label}</span>
                      {tab.count !== null && tab.count !== undefined && (
                        <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === tab.id
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-600'
                          }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <InventoryTable
                      inventory={inventory}
                      onStockUpdate={handleStockUpdate}
                      onReorderLevelUpdate={handleReorderLevelUpdate}
                      updateStock={updateStock}
                      setReorderLevel={setReorderLevel}
                      getStockBadge={getStockBadge}
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
                    <h3 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h3>
                    {alerts.length > 0 ? (
                      <div className="space-y-3">
                        {alerts.map((alert) => (
                          <div key={alert.id} className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-amber-100 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-amber-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{alert.productId.name}</p>
                                <p className="text-sm text-gray-600">
                                  Current stock: {alert.currentStock} • Reorder level: {alert.reorderLevel}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleResolveAlert(alert.id)}
                              disabled={resolveLowStockAlert.isPending}
                              className="px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 text-sm"
                            >
                              {resolveLowStockAlert.isPending ? 'Resolving...' : 'Resolve'}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No low stock alerts</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Stock history feature coming soon</p>
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
