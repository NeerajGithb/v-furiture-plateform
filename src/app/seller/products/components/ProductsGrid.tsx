import { MoreVertical, Eye, Edit, Copy, Trash2, Package } from 'lucide-react';
import { useNavigate } from '@/components/NavigationLoader';
import { useConfirm } from '@/contexts/ConfirmContext';
import { formatCurrency } from '@/utils/currency';
import { SellerProduct } from '@/types/seller/products';

interface ProductsGridProps {
  products: SellerProduct[];
  expandedProduct: string | null;
  selectedProducts: string[];
  onExpandProduct: (productId: string | null) => void;
  onToggleSelection: (productId: string) => void;
  onSelectAll: (checked: boolean) => void;
  onUpdateStatus: (productId: string, isPublished: boolean) => void;
  onDeleteProduct: (productId: string) => void;
  onDuplicateProduct: (productId: string) => void;
  isUpdating: boolean;
}

const STATUS_BADGE: Record<string, { dot: string; label: string; color: string }> = {
  published: { dot: 'bg-emerald-400', label: 'Published', color: 'text-emerald-700' },
  draft: { dot: 'bg-[#9CA3AF]', label: 'Draft', color: 'text-[#6B7280]' },
  pending: { dot: 'bg-amber-400', label: 'Pending', color: 'text-amber-700' },
  approved: { dot: 'bg-blue-400', label: 'Approved', color: 'text-blue-700' },
  rejected: { dot: 'bg-rose-400', label: 'Rejected', color: 'text-rose-600' },
};

export function ProductsGrid({
  products,
  expandedProduct,
  selectedProducts,
  onExpandProduct,
  onToggleSelection,
  onSelectAll,
  onUpdateStatus,
  onDeleteProduct,
  onDuplicateProduct,
  isUpdating,
}: ProductsGridProps) {
  const router = useNavigate();
  const { confirm } = useConfirm();

  const handleDeleteClick = (productId: string, productName: string) => {
    confirm({
      title: 'Delete Product',
      message: `Delete "${productName}"? This cannot be undone.`,
      type: 'delete',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => onDeleteProduct(productId),
    });
  };

  return (
    <>
      {/* Selection banner */}
      {selectedProducts.length > 0 && (
        <div className="mb-4 bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg px-4 py-2.5 flex items-center justify-between">
          <span className="text-[12px] font-semibold text-[#374151]">
            {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={() => onSelectAll(false)}
            className="text-[12px] text-[#6B7280] hover:text-[#111111] transition-colors font-medium"
          >
            Clear selection
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => {
          const status = product.status || 'draft';
          const badge = STATUS_BADGE[status] || STATUS_BADGE.draft;

          return (
            <div
              key={product.id}
              className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden hover:border-[#D1D5DB] hover:shadow-sm transition-all duration-150 group"
            >
              {/* Image area */}
              <div className="aspect-[4/3] bg-[#F8F9FA] relative">
                {/* Checkbox */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={e => { e.stopPropagation(); onToggleSelection(product.id); }}
                    onClick={e => e.stopPropagation()}
                    className="w-3.5 h-3.5 border-[#D1D5DB] rounded accent-[#111111] cursor-pointer"
                  />
                </div>

                {/* Status badge */}
                <div className="absolute top-2.5 left-8 z-10">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/90 backdrop-blur-sm border border-[#E5E7EB] rounded-md text-[10px] font-semibold shadow-sm">
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                    <span className={badge.color}>{badge.label}</span>
                  </span>
                </div>

                {/* Menu button */}
                <div className="absolute top-2.5 right-2.5 z-10">
                  <div className="relative">
                    <button
                      onClick={() => onExpandProduct(expandedProduct === product.id ? null : product.id)}
                      aria-label="Product options"
                      className="p-1.5 bg-white border border-[#E5E7EB] rounded-md shadow-sm hover:bg-[#F8F9FA] transition-colors"
                    >
                      <MoreVertical className="w-3.5 h-3.5 text-[#6B7280]" />
                    </button>

                    {expandedProduct === product.id && (
                      <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-[#E5E7EB] py-1 z-20 min-w-[160px]">
                        {[
                          { icon: Eye, label: 'View Details', onClick: () => router.push(`/seller/products/${product.id}`) },
                          { icon: Edit, label: 'Edit', onClick: () => router.push(`/seller/products/new?id=${product.id}`) },
                          { icon: Copy, label: 'Duplicate', onClick: () => onDuplicateProduct(product.id), disabled: isUpdating },
                        ].map(({ icon: Icon, label, onClick, disabled }) => (
                          <button
                            key={label}
                            onClick={onClick}
                            disabled={disabled}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#374151] hover:bg-[#F8F9FA] disabled:opacity-40 transition-colors"
                          >
                            <Icon className="w-3.5 h-3.5 text-[#9CA3AF]" />
                            {label}
                          </button>
                        ))}
                        <div className="border-t border-[#F3F4F6] my-1" />
                        <button
                          onClick={() => onUpdateStatus(product.id, !product.isPublished)}
                          disabled={isUpdating}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#374151] hover:bg-[#F8F9FA] disabled:opacity-40 transition-colors"
                        >
                          {product.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product.id, product.name)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {product.mainImage?.url ? (
                  <img
                    src={product.mainImage.url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-10 h-10 text-[#D1D5DB]" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-[13px] font-semibold text-[#111111] line-clamp-1 mb-0.5">{product.name}</h3>
                <p className="text-[11px] text-[#9CA3AF] line-clamp-2 mb-3 leading-relaxed">{product.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[14px] font-bold text-[#111111] tabular-nums">
                      {formatCurrency(product.finalPrice)}
                    </span>
                    {product.originalPrice !== product.finalPrice && (
                      <span className="text-[11px] text-[#9CA3AF] line-through tabular-nums">
                        {formatCurrency(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-[#9CA3AF]">
                    Stock: <span className="text-[#374151] font-semibold">{product.inStockQuantity || 0}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
