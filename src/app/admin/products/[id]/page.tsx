'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useAdminProduct,
  useUpdateAdminProduct,
  useTogglePublishProduct,
  useDeleteAdminProduct
} from '@/hooks/admin/useAdminProducts';
import { useProductUIStore } from '@/stores/admin/productStore';
import { useConfirm } from '@/contexts/ConfirmContext';
import { LoaderGuard } from '@/components/ui/LoaderGuard';
import ProductHeader from './components/ProductHeader';
import ProductSidebar from './components/ProductSidebar';
import ProductDetails from './components/ProductDetails';
import ProductModals from './components/ProductModals';
import PageHeader from '@/components/PageHeader';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const router = useRouter();
  const [productId, setProductId] = useState<string>('');
  
  const showRejectModal = useProductUIStore(s => s.showRejectModal);
  const setShowRejectModal = useProductUIStore(s => s.setShowRejectModal);
  const showDeleteModal = useProductUIStore(s => s.showDeleteModal);
  const setShowDeleteModal = useProductUIStore(s => s.setShowDeleteModal);
  
  const { data: product, isPending, error, refetch, isFetching } = useAdminProduct(productId);
  const updateProduct = useUpdateAdminProduct();
  const togglePublish = useTogglePublishProduct();
  const deleteProduct = useDeleteAdminProduct();
  const { confirm } = useConfirm();

  const isMutating = updateProduct.isPending || togglePublish.isPending || deleteProduct.isPending;

  useEffect(() => {
    params.then(p => setProductId(p.id));
  }, [params]);

  const handleApprove = () => {
    if (!product) return;
    updateProduct.mutate({ productId: product.id, data: { status: 'APPROVED' } });
  };

  const handleReject = (reason: string) => {
    if (!product) return;
    updateProduct.mutate({ productId: product.id, data: { status: 'REJECTED', rejectionReason: reason } });
  };

  const handleSetPending = () => {
    if (!product) return;
    updateProduct.mutate({ productId: product.id, data: { status: 'PENDING' } });
  };

  const handleTogglePublish = () => {
    if (!product) return;
    togglePublish.mutate({ productId: product.id, isPublished: !product.isPublished });
  };

  const handleDelete = () => {
    if (!product) return;
    confirm({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      type: 'delete',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        deleteProduct.mutate(product.id);
        router.push('/admin/products');
      }
    });
  };

  return (
    <>
      <PageHeader
        title="Product Details"
        description="View and manage product information"
        onRefresh={refetch}
        isRefreshing={isFetching}
      />

      <LoaderGuard isLoading={isPending} error={error} isEmpty={!product}>
        {() => (
          <>
            <ProductHeader
              product={product!}
              isMutating={isMutating}
              onApprove={handleApprove}
              onReject={() => setShowRejectModal(true)}
              onSetPending={handleSetPending}
              onTogglePublish={handleTogglePublish}
              onDelete={handleDelete}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ProductSidebar product={product!} />
              <div className="lg:col-span-2">
                <ProductDetails product={product!} />
              </div>
            </div>

            <ProductModals
              product={product!}
              isMutating={isMutating}
              showRejectModal={showRejectModal}
              showDeleteModal={showDeleteModal}
              onCloseRejectModal={() => setShowRejectModal(false)}
              onCloseDeleteModal={() => setShowDeleteModal(false)}
              onReject={handleReject}
              onDelete={handleDelete}
            />
          </>
        )}
      </LoaderGuard>
    </>
  );
}
