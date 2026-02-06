'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useAdminProduct,
  useUpdateAdminProduct,
  useDeleteAdminProduct
} from '@/hooks/admin/useAdminProducts';
import ProductHeader from './components/ProductHeader';
import ProductSidebar from './components/ProductSidebar';
import ProductDetails from './components/ProductDetails';
import ProductModals from './components/ProductModals';
import ProductDetailSkeleton from './components/ProductDetailSkeleton';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
    const router = useRouter();
    const [productId, setProductId] = useState<string>('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    // React Query hooks
    const { data: currentProduct, isLoading, error, refetch } = useAdminProduct(productId);
    const { mutate: updateProduct, isPending: updatePending } = useUpdateAdminProduct();
    const { mutate: deleteProduct, isPending: deletePending } = useDeleteAdminProduct();

    const isMutating = updatePending || deletePending;

    useEffect(() => {
        params.then(p => setProductId(p.id));
    }, [params]);

    const handleApprove = async () => {
        if (!currentProduct) return;
        updateProduct({ productId: currentProduct._id, data: { status: 'approved' } });
    };

    const handleReject = async (reason: string) => {
        if (!currentProduct) return;
        updateProduct({ productId: currentProduct._id, data: { status: 'rejected', rejectionReason: reason } });
    };

    const handleSetPending = async () => {
        if (!currentProduct) return;
        updateProduct({ productId: currentProduct._id, data: { status: 'pending' } });
    };

    const handleDelete = async () => {
        if (!currentProduct) return;
        deleteProduct(currentProduct._id);
        router.push('/admin/products');
    };

    return (
        <>
            {isLoading && <ProductDetailSkeleton />}
            {!isLoading && error && (
                <div className="p-6">
                    <div className="bg-red-50 border border-red-200 rounded p-4 text-center">
                        <p className="text-red-800">{error instanceof Error ? error.message : 'Product not found'}</p>
                        <div className="mt-4 flex gap-2 justify-center">
                            <button
                                onClick={() => refetch()}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Retry
                            </button>
                            <button
                                onClick={() => router.push('/admin/products')}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                ← Back to Products
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {!isLoading && !error && currentProduct && (
                <div className="p-6 bg-gray-50 min-h-screen">
                    <ProductHeader
                        product={currentProduct}
                        isMutating={isMutating}
                        onApprove={handleApprove}
                        onReject={() => setShowRejectModal(true)}
                        onSetPending={() => handleSetPending()}
                        onDelete={() => setShowDeleteModal(true)}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Images & Analytics */}
                        <ProductSidebar product={currentProduct} />

                        {/* Right Column - Details */}
                        <div className="lg:col-span-2">
                            <ProductDetails product={currentProduct} />
                        </div>
                    </div>

                    <ProductModals
                        product={currentProduct}
                        isMutating={isMutating}
                        showRejectModal={showRejectModal}
                        showDeleteModal={showDeleteModal}
                        onCloseRejectModal={() => setShowRejectModal(false)}
                        onCloseDeleteModal={() => setShowDeleteModal(false)}
                        onReject={handleReject}
                        onDelete={handleDelete}
                    />
                </div>
            )}
        </>
    );
}
