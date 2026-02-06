import { Package, Eye, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { AdminProduct } from '@/types/adminProduct';
import { useRouter } from 'next/navigation';

interface ProductsTableProps {
    products: AdminProduct[];
    onApprove: (productId: string) => void;
    onReject: (productId: string, reason: string) => void;
    onDelete?: (productId: string) => void;
    onBulkApprove?: (productIds: string[]) => void;
    onBulkReject?: (productIds: string[], reason: string) => void;
    onBulkDelete?: (productIds: string[]) => void;
    selectedProducts: string[];
    onSelectProduct: (productId: string) => void;
    onSelectAll: (selected: boolean) => void;
}

export default function ProductsTable({
    products,
    onApprove,
    onReject,
    selectedProducts,
    onSelectProduct,
    onSelectAll
}: ProductsTableProps) {
    const router = useRouter();
    const allSelected = products.length > 0 && selectedProducts.length === products.length;
    const someSelected = selectedProducts.length > 0 && selectedProducts.length < products.length;

    const getStatusBadge = (status: string) => {
        const styles = {
            PENDING: 'bg-amber-50 text-amber-700 ring-amber-600/20',
            APPROVED: 'bg-green-50 text-green-700 ring-green-600/20',
            REJECTED: 'bg-red-50 text-red-700 ring-red-600/20',
            UNPUBLISHED: 'bg-gray-50 text-gray-700 ring-gray-600/20',
            pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
            approved: 'bg-green-50 text-green-700 ring-green-600/20',
            rejected: 'bg-red-50 text-red-700 ring-red-600/20',
        };
        const style = styles[status as keyof typeof styles] || styles.PENDING;
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ring-1 ring-inset ${style}`}>
                {status || 'PENDING'}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left w-10">
                                <input
                                    type="checkbox"
                                    checked={allSelected}
                                    ref={input => {
                                        if (input) input.indeterminate = someSelected;
                                    }}
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                                />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Product</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Seller</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Category</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">Price</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">Stock</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-12 text-center">
                                    <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                    <p className="text-sm font-medium text-gray-900">No products found</p>
                                    <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
                                </td>
                            </tr>
                        ) : (
                            products.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(product._id)}
                                            onChange={() => onSelectProduct(product._id)}
                                            className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {product.mainImage?.url ? (
                                                <img
                                                    src={product.mainImage.url}
                                                    alt={product.name}
                                                    className="w-10 h-10 rounded-md object-cover bg-gray-50 border border-gray-100"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-gray-400" />
                                                </div>
                                            )}
                                            <div className="min-w-0 max-w-xs">
                                                <p className="text-sm font-medium text-gray-900 truncate" title={product.name}>
                                                    {product.name}
                                                </p>
                                                <p className="text-xs text-gray-500 font-mono mt-0.5">
                                                    {product._id.slice(-6).toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-900 truncate max-w-[150px]" title={product.sellerId?.businessName}>
                                                {product.sellerId?.businessName || 'N/A'}
                                            </span>
                                            <span className="text-xs text-gray-500 truncate max-w-[150px]">
                                                {product.sellerId?.email}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                            {product.categoryId?.name || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatCurrency(product.finalPrice)}
                                            </span>
                                            {product.originalPrice > product.finalPrice && (
                                                <span className="text-xs text-gray-400 line-through">
                                                    {formatCurrency(product.originalPrice)}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${product.inStockQuantity > 0
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'bg-red-50 text-red-700'
                                            }`}>
                                            {product.inStockQuantity}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {getStatusBadge(product.status)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => router.push(`/admin/products/${product._id}`)}
                                                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>

                                            {product.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => onApprove(product._id)}
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const reason = prompt('Enter rejection reason:');
                                                            if (reason) onReject(product._id, reason);
                                                        }}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
