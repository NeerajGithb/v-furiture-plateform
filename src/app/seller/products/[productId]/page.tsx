'use client';

import { useEffect, useState } from 'react';
import { 
  useSellerProduct, 
  useUpdateProductStatus, 
  useDeleteProduct, 
  useDuplicateProduct,
  useProductAnalytics,
  useProductReviews
} from '@/hooks/seller/useSellerProducts';
import { AlertCircle, RefreshCw } from 'lucide-react';

const Loader = ({ text = 'Loading...', fullScreen = false }) => {
  const containerClasses = fullScreen
    ? 'flex items-center justify-center min-h-screen'
    : 'flex items-center justify-center min-h-[60vh]';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="animate-spin rounded-full border-b-2 h-12 w-12 border-blue-600 mx-auto"></div>
        {text && <p className="mt-4 text-gray-600">{text}</p>}
      </div>
    </div>
  );
};
import { ProductDetailHeader } from './components/ProductDetailHeader';
import { ProductImageGallery } from './components/ProductImageGallery';
import { ProductInformation } from './components/ProductInformation';
import { ProductAnalytics } from './components/ProductAnalytics';
import { ProductReviews } from './components/ProductReviews';

export default function SellerProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
    const [productId, setProductId] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'reviews'>('overview');
    const [refreshing, setRefreshing] = useState(false);
    
    useEffect(() => {
        params.then(p => setProductId(p.productId));
    }, [params]);

    // React Query hooks
    const { data: product, isLoading, error, refetch } = useSellerProduct(productId, !!productId);
    const { data: analytics } = useProductAnalytics(productId, '30days', !!productId);
    const { data: reviewsData } = useProductReviews(productId, { page: 1, limit: 10 }, !!productId);
    
    // Mutations
    const updateProductStatus = useUpdateProductStatus();
    const deleteProduct = useDeleteProduct();
    const duplicateProduct = useDuplicateProduct();

    const handleUpdateStatus = (isPublished: boolean) => {
        updateProductStatus.mutate({ productId, isPublished });
    };

    const handleDeleteProduct = () => {
        deleteProduct.mutate(productId);
    };

    const handleDuplicateProduct = () => {
        duplicateProduct.mutate(productId);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setTimeout(() => setRefreshing(false), 500);
    };

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Product</h3>
                    <p className="text-gray-600 mb-4">
                        {error instanceof Error ? error.message : 'Unable to load product data. Please try again.'}
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

    if (isLoading) {
        return <Loader />;
    }

    if (!product) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Not Found</h3>
                    <p className="text-gray-600 mb-4">
                        The product you're looking for doesn't exist or has been removed.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <ProductDetailHeader 
                product={product} 
                productId={productId}
                onUpdateStatus={handleUpdateStatus}
                onDeleteProduct={handleDeleteProduct}
                onDuplicateProduct={handleDuplicateProduct}
                isUpdating={updateProductStatus.isPending || deleteProduct.isPending || duplicateProduct.isPending}
            />
            
            {/* Enhanced Tabs */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'overview', label: 'Overview', count: null },
                            { id: 'analytics', label: 'Analytics', count: null },
                            { id: 'reviews', label: 'Reviews', count: reviewsData?.summary?.count }
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
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Images */}
                            <div className="space-y-6">
                                <ProductImageGallery product={product} />
                            </div>

                            {/* Right Column - Information */}
                            <div className="lg:col-span-2">
                                <ProductInformation product={product} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <ProductAnalytics 
                            product={product} 
                            analytics={analytics}
                        />
                    )}

                    {activeTab === 'reviews' && (
                        <ProductReviews 
                            reviewsData={reviewsData}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}