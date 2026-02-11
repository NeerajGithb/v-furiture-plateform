'use client';

import { use } from 'react';
import { useState } from 'react';
import { 
  useSellerProduct, 
  useUpdateProductStatus, 
  useDeleteProduct, 
  useDuplicateProduct,
  useProductAnalytics,
  useProductReviews
} from '@/hooks/seller/useSellerProducts';
import { LoaderGuard } from '@/components/ui/LoaderGuard';
import { ProductDetailHeader } from './components/ProductDetailHeader';
import { ProductImageGallery } from './components/ProductImageGallery';
import { ProductInformation } from './components/ProductInformation';
import { ProductAnalytics } from './components/ProductAnalytics';
import { ProductReviews } from './components/ProductReviews';
import PageHeader from '@/components/PageHeader';

export default function SellerProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
    const { productId } = use(params);
    const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'reviews'>('overview');

    const { data: product, isPending, error, refetch, isFetching } = useSellerProduct(productId);
    const { data: analytics } = useProductAnalytics(productId);
    const { data: reviewsData } = useProductReviews(productId, { page: 1, limit: 10 });
    
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

    return (
        <>
            <PageHeader
                title={product?.name || "Product Details"}
                description="View and manage product information"
                onRefresh={refetch}
                isRefreshing={isFetching}
            />
            
            <LoaderGuard 
                isLoading={isPending} 
                error={error}
                isEmpty={!product}
                emptyMessage="Product not found"
            >
                {() => (
                    <div className="max-w-7xl mx-auto p-6 space-y-6">
                        <ProductDetailHeader 
                            product={product!} 
                            productId={productId}
                            onUpdateStatus={handleUpdateStatus}
                            onDeleteProduct={handleDeleteProduct}
                            onDuplicateProduct={handleDuplicateProduct}
                            isUpdating={updateProductStatus.isPending || deleteProduct.isPending || duplicateProduct.isPending}
                        />
                        
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
                                        <div className="space-y-6">
                                            <ProductImageGallery product={product!} />
                                        </div>

                                        <div className="lg:col-span-2">
                                            <ProductInformation product={product!} />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'analytics' && (
                                    <ProductAnalytics 
                                        product={product!} 
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
                )}
            </LoaderGuard>
        </>
    );
}