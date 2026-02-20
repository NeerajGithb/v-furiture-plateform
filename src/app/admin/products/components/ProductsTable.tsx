import { Package, Eye, CheckCircle, XCircle, Download } from 'lucide-react';
import type { AdminProduct } from '@/types/admin/products';
import { useRouter } from 'next/navigation';
import { useProductUIStore } from '@/stores/admin/productStore';

interface ProductsTableProps {
    products?: AdminProduct[];
    onApprove: (productId: string) => void;
    onReject: (productId: string, reason: string) => void;
    onDelete?: (productId: string) => void;
    onBulkApprove?: (productIds: string[]) => void;
    onBulkReject?: (productIds: string[], reason: string) => void;
    onBulkDelete?: (productIds: string[]) => void;
    onExport?: () => void;
    isExporting?: boolean;
    isUpdating?: boolean;
}

export default function ProductsTable({
    products,
    onApprove,
    onReject,
    onExport,
    isExporting,
}: ProductsTableProps) {
    const router = useRouter();
    const selectedProducts = useProductUIStore(s => s.selectedProducts);
    const setSelectedProducts = useProductUIStore(s => s.setSelectedProducts);
    const toggleProductSelection = useProductUIStore(s => s.toggleProductSelection);

    const allSelected = products && products.length > 0 && selectedProducts.length === products.length;
    const someSelected = selectedProducts.length > 0 && selectedProducts.length < (products?.length || 0);

    const handleSelectAll = (checked: boolean) => {
        if (checked && products) {
            setSelectedProducts(products.map(p => p.id));
        } else {
            setSelectedProducts([]);
        }
    };

    const handleSelectProduct = (productId: string) => {
        toggleProductSelection(productId);
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            PENDING: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
            APPROVED: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
            REJECTED: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
        };
        const style = styles[status as keyof typeof styles] || styles.PENDING;
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${style}`}>
                {status || 'PENDING'}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
            {onExport && (
                <div className="p-4 border-b border-[#E5E7EB] flex justify-end">
                    <button
                        onClick={onExport}
                        disabled={isExporting}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium text-[#555555] bg-white border border-[#E5E7EB] rounded-md hover:bg-[#F8F9FA] hover:text-[#111111] hover:border-[#D1D5DB] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#111111] focus:ring-offset-1"
                    >
                        <Download className="w-3.5 h-3.5" />
                        {isExporting ? 'Exporting...' : 'Export'}
                    </button>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#E5E7EB]">
                    <thead className="bg-[#F8F9FA]">
                        <tr>
                            <th className="px-4 py-3 text-left w-10">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    ref={input => {
                                        if (input) input.indeterminate = someSelected;
                                    }}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    className="w-4 h-4 text-[#111111] border-[#D1D5DB] rounded focus:ring-[#111111] focus:ring-offset-0"
                                />
                            </th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#555555] uppercase tracking-wider">Product</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#555555] uppercase tracking-wider">Seller</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#555555] uppercase tracking-wider">Category</th>
                            <th className="px-4 py-3 text-right text-[11px] font-semibold text-[#555555] uppercase tracking-wider">Price</th>
                            <th className="px-4 py-3 text-center text-[11px] font-semibold text-[#555555] uppercase tracking-wider">Stock</th>
                            <th className="px-4 py-3 text-left text-[11px] font-semibold text-[#555555] uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-center text-[11px] font-semibold text-[#555555] uppercase tracking-wider">Published</th>
                            <th className="px-4 py-3 text-right text-[11px] font-semibold text-[#555555] uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#E5E7EB]">
                        {products?.map((product) => (
                            <tr key={product.id} className="hover:bg-[#F8F9FA] transition-colors group">
                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.includes(product.id)}
                                        onChange={() => handleSelectProduct(product.id)}
                                        className="w-4 h-4 text-[#111111] border-[#D1D5DB] rounded focus:ring-[#111111] focus:ring-offset-0"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        {product.images?.[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-10 h-10 rounded-md object-cover bg-[#F8F9FA] border border-[#E5E7EB]"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-md bg-[#F1F3F5] flex items-center justify-center">
                                                <Package className="w-5 h-5 text-[#9CA3AF]" />
                                            </div>
                                        )}
                                        <div className="min-w-0 max-w-xs">
                                            <p className="text-[13px] font-medium text-[#111111] truncate" title={product.name}>
                                                {product.name}
                                            </p>
                                            <p className="text-[11px] text-[#6B7280] font-mono mt-0.5">
                                                {product.sku}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="text-[13px] text-[#111111] truncate max-w-[150px]" title={product.sellerId?.businessName}>
                                            {product.sellerId?.businessName || 'N/A'}
                                        </span>
                                        <span className="text-[11px] text-[#6B7280] truncate max-w-[150px]">
                                            {product.sellerId?.email}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F1F3F5] text-[#555555] border border-[#E5E7EB]">
                                        {product.categoryId?.name || 'Uncategorized'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className="text-[13px] font-medium text-[#111111]">
                                        ₹{(product.price || 0).toLocaleString('en-IN')}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${(product.stock || 0) > 0
                                        ? 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
                                        : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                                        }`}>
                                        {product.stock || 0}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {getStatusBadge(product.status)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {product.isPublished ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                                            Published
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F1F3F5] text-[#555555] border border-[#E5E7EB]">
                                            Unpublished
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => router.push(`/admin/products/${product.id}`)}
                                            className="p-1.5 text-[#555555] hover:text-[#111111] hover:bg-[#F1F3F5] rounded-md transition-all"
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>

                                        {product.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => onApprove(product.id)}
                                                    className="p-1.5 text-[#059669] hover:bg-[#ECFDF5] rounded-md transition-all"
                                                    title="Approve"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const reason = prompt('Enter rejection reason:');
                                                        if (reason) onReject(product.id, reason);
                                                    }}
                                                    className="p-1.5 text-[#DC2626] hover:bg-[#FEF2F2] rounded-md transition-all"
                                                    title="Reject"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
