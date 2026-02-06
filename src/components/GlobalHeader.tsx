'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import { TimePeriod, useGlobalFilterStore } from '@/stores/globalFilterStore';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from '@/components/NavigationLoader';
import { Search, X } from 'lucide-react';

const timePeriods: { value: TimePeriod; label: string; shortLabel: string }[] = [
  { value: '30min', label: '30 Minutes', shortLabel: '30m' },
  { value: '1hour', label: '1 Hour', shortLabel: '1h' },
  { value: '1day', label: '24 Hours', shortLabel: '24h' },
  { value: '7days', label: '7 Days', shortLabel: '7d' },
  { value: '30days', label: '30 Days', shortLabel: '30d' },
  { value: '1year', label: '1 Year', shortLabel: '1y' },
  { value: 'all', label: 'All Time', shortLabel: 'All' },
];

export default function GlobalHeader() {
  const router = useNavigate();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Local state for search input (for immediate UI update)
  const [searchInput, setSearchInput] = useState('');

  const {
    period,
    setPeriod,
    search,
    setSearch,
    productStatus,
    setProductStatus,
    orderStatus,
    setOrderStatus,
    stockStatus,
    setStockStatus,
    clearFilters,
    clearSectionFilters
  } = useGlobalFilterStore();

  // Detect current section
  const currentSection = useMemo(() => {
    if (pathname?.includes('/products')) return 'products';
    if (pathname?.includes('/orders')) return 'orders';
    if (pathname?.includes('/inventory')) return 'inventory';
    if (pathname?.includes('/dashboard')) return 'dashboard';
    return null;
  }, [pathname]);

  // Detect if on a detail/edit page (no filters needed)
  const isDetailPage = useMemo(() => {
    if (!pathname) return false;

    // Seller routes to exclude
    const isSellerProfile = pathname.includes('/seller/profile');
    const isOrderDetail = /\/seller\/orders\/[^\/]+$/.test(pathname); // /seller/orders/[orderId]
    const isProductNew = pathname.includes('/seller/products/new');
    const isProductEdit = /\/seller\/products\/[^\/]+$/.test(pathname) && !pathname.includes('/new'); // /seller/products/[productId]

    // Admin routes to exclude
    const isAdminCoupons = pathname.includes('/admin/coupons');
    const isAdminProductDetail = /\/admin\/products\/[^\/]+$/.test(pathname); // /admin/products/[id]

    return isSellerProfile || isOrderDetail || isProductNew || isProductEdit ||
      isAdminCoupons || isAdminProductDetail;
  }, [pathname]);

  // Clear section-specific filters when section changes
  useEffect(() => {
    clearSectionFilters();

    // Also clear section-specific URL params
    const urlParams = new URLSearchParams(searchParams.toString());
    urlParams.delete('productStatus');
    urlParams.delete('orderStatus');
    urlParams.delete('stockStatus');

    const newUrl = `${pathname}?${urlParams.toString()}`;
    router.push(newUrl, { scroll: false });
  }, [currentSection]);

  // Sync URL params with store on mount/change
  useEffect(() => {
    const urlPeriod = searchParams.get('period') as TimePeriod;
    const urlSearch = searchParams.get('search') || undefined;
    const urlProductStatus = searchParams.get('productStatus') || undefined;
    const urlOrderStatus = searchParams.get('orderStatus') || undefined;
    const urlStockStatus = searchParams.get('stockStatus') || undefined;

    // Only update if values actually changed to prevent unnecessary re-renders
    let hasChanges = false;

    if (urlPeriod && urlPeriod !== period) {
      setPeriod(urlPeriod);
      hasChanges = true;
    } else if (!urlPeriod && period !== 'all') {
      setPeriod('all');
      hasChanges = true;
    }

    if (urlSearch !== search) {
      setSearch(urlSearch);
      hasChanges = true;
    }

    if (urlProductStatus !== productStatus) {
      setProductStatus(urlProductStatus);
      hasChanges = true;
    }

    if (urlOrderStatus !== orderStatus) {
      setOrderStatus(urlOrderStatus);
      hasChanges = true;
    }

    if (urlStockStatus !== stockStatus) {
      setStockStatus(urlStockStatus);
      hasChanges = true;
    }

    // Sync local search input with URL/store only if search changed
    if (urlSearch !== searchInput) {
      setSearchInput(urlSearch || '');
    }
  }, [searchParams.toString()]);

  // Debounce search input - update global store after 500ms of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedSearch = searchInput.trim() || undefined;
      if (trimmedSearch !== search) {
        setSearch(trimmedSearch);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Sync store state to URL (debounced to batch multiple filter changes)
  useEffect(() => {
    const timer = setTimeout(() => {
      const urlParams = new URLSearchParams();

      // Add all active filters to URL
      if (period && period !== 'all') urlParams.set('period', period);
      if (search) urlParams.set('search', search);
      if (productStatus) urlParams.set('productStatus', productStatus);
      if (orderStatus) urlParams.set('orderStatus', orderStatus);
      if (stockStatus) urlParams.set('stockStatus', stockStatus);

      const newUrl = `${pathname}?${urlParams.toString()}`;
      const currentUrl = `${pathname}?${searchParams.toString()}`;

      // Only update if URL actually changed
      if (newUrl !== currentUrl) {
        router.push(newUrl, { scroll: false });
      }
    }, 100); // Small delay to batch rapid changes

    return () => clearTimeout(timer);
  }, [period, search, productStatus, orderStatus, stockStatus, pathname]);

  const updateURL = (params: Record<string, string | undefined>) => {
    const urlParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'all') {
        urlParams.set(key, value);
      } else {
        urlParams.delete(key);
      }
    });

    const newUrl = `${pathname}?${urlParams.toString()}`;
    router.push(newUrl, { scroll: false });
  };

  const handlePeriodChange = (newPeriod: TimePeriod) => {
    setPeriod(newPeriod);
    // URL will be updated by the debounced effect
  };

  const handleSearchChange = (value: string) => {
    // Update local input immediately (debouncing will sync to store)
    setSearchInput(value);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearch(undefined);
    // URL will be updated by the debounced effect
  };

  const handleProductStatusChange = (value: string) => {
    const statusValue = value === 'all' ? undefined : value;
    setProductStatus(statusValue);
    // URL will be updated by the debounced effect
  };

  const handleOrderStatusChange = (value: string) => {
    const statusValue = value === 'all' ? undefined : value;
    setOrderStatus(statusValue);
    // URL will be updated by the debounced effect
  };

  const handleStockStatusChange = (value: string) => {
    const statusValue = value === 'all' ? undefined : value;
    setStockStatus(statusValue);
    // URL will be updated by the debounced effect
  };

  const handleClearFilters = () => {
    setSearchInput('');
    clearFilters();
    router.push(pathname || '/', { scroll: false });
  };

  const hasActiveFilters = search || productStatus || orderStatus || stockStatus || period !== 'all';

  // Simplified header for detail/edit pages
  if (isDetailPage) {
    return null;
  }

  // Full header with filters for list pages
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-6 py-2.5">
        <div className="flex items-center gap-4">
          {/* Period Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Period:</span>
            <div className="flex bg-gray-50 p-0.5 rounded-md border border-gray-200">
              {timePeriods.map((periodOption) => (
                <button
                  key={periodOption.value}
                  onClick={() => handlePeriodChange(periodOption.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-all whitespace-nowrap ${period === periodOption.value
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <span className="hidden lg:inline">{periodOption.label}</span>
                  <span className="lg:hidden">{periodOption.shortLabel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          {currentSection && currentSection !== 'dashboard' && (
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={`Search ${currentSection}...`}
                  className="w-full pl-8 pr-8 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                />
                {searchInput && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Products Status Filter */}
          {currentSection === 'products' && (
            <select
              value={productStatus || 'all'}
              onChange={(e) => handleProductStatusChange(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-white"
            >
              <option value="all">All Products</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="outOfStock">Out of Stock</option>
              <option value="lowStock">Low Stock</option>
            </select>
          )}

          {/* Orders Status Filter */}
          {currentSection === 'orders' && (
            <select
              value={orderStatus || 'all'}
              onChange={(e) => handleOrderStatusChange(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-white"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}

          {/* Inventory Stock Filter */}
          {currentSection === 'inventory' && (
            <select
              value={stockStatus || 'all'}
              onChange={(e) => handleStockStatusChange(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-white"
            >
              <option value="all">All Items</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-300 rounded transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
