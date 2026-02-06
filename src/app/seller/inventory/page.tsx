'use client';

import { useState } from 'react';
import {
  useSellerInventory,
  useSellerInventoryStats,
  useUpdateStock,
  useSetReorderLevel,
  useBulkUpdateStock,
  useStockHistory,
  useLowStockAlerts,
  useResolveLowStockAlert,
  useExportInventory
} from '@/hooks/seller/useSellerInventory';
import { InventoryQuery, StockUpdateType } from '@/types/sellerInventory';
import InventorySkeleton from '../components/skeletons/InventorySkeleton';
import {
  InventoryHeader,
  InventoryStats,
  InventoryTable,
  InventoryFilters,
  InventoryPagination
} from './components';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function SellerInventoryPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'history'>('overview');
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters state
  const [filters, setFilters] = useState<InventoryQuery>({
    page: 1,
    limit: 20,
    status: undefined,
    search: '',
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  });

  // Selection state
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // React Query hooks
  const { data: inventoryData, isLoading, error, refetch } = useSellerInventory(filters);
  const { data: stats } = useSellerInventoryStats();
  const { data: alertsData } = useLowStockAlerts({ status: 'active' });
  
  // Mutations
  const updateStock = useUpdateStock();
  const setReorderLevel = useSetReorderLevel();
  const bulkUpdateStock = useBulkUpdateStock();
  const resolveLowStockAlert = useResolveLowStockAlert();
  const exportInventory = useExportInventory();

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

  const handleBulkStockUpdate = (type: StockUpdateType, quantity: number, reason?: string) => {
    bulkUpdateStock.mutate({
      items: selectedItems.map(productId => ({ productId, quantity, type })),
      reason
    });
    setSelectedItems([]);
  };

  const handleExport = (options = {}) => {
    exportInventory.mutate({
      status: filters.status,
      search: filters.search,
      format: 'xlsx',
      includeHistory: true,
      ...options
    });
  };

  const handleResolveAlert = (alertId: string) => {
    resolveLowStockAlert.mutate(alertId);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleToggleItemSelection = (productId: string) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAllItems = () => {
    setSelectedItems(inventory.map(item => item.productId._id));
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Inventory</h3>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'Unable to load inventory data. Please try again.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Retrying...' : 'Retry'}
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && <InventorySkeleton />}
      {!isLoading && (
        <div className="space-y-6 max-w-7xl mx-auto">
          <InventoryHeader
            selectedItems={selectedItems}
            onBulkStockUpdate={handleBulkStockUpdate}
            onExport={handleExport}
            bulkUpdateStock={bulkUpdateStock}
            exportInventory={exportInventory}
          />

          <InventoryStats stats={stats} />

          {/* Enhanced Tabs */}
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
                  <InventoryFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                  />

                  <InventoryTable
                    inventory={inventory}
                    selectedItems={selectedItems}
                    onToggleItemSelection={handleToggleItemSelection}
                    onSelectAllItems={handleSelectAllItems}
                    onClearSelection={handleClearSelection}
                    onStockUpdate={handleStockUpdate}
                    onReorderLevelUpdate={handleReorderLevelUpdate}
                    updateStock={updateStock}
                    setReorderLevel={setReorderLevel}
                    getStockBadge={getStockBadge}
                  />

                  <InventoryPagination
                    pagination={pagination}
                    onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
                  />
                </div>
              )}

              {activeTab === 'alerts' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h3>
                  {alerts.length > 0 ? (
                    <div className="space-y-3">
                      {alerts.map((alert) => (
                        <div key={alert._id} className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
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
                            onClick={() => handleResolveAlert(alert._id)}
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
    </>
  );
}