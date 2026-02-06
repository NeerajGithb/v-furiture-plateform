import { JSX } from 'react';
import { XCircle, Package, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { AdminProduct } from '@/types/adminProduct';

type ProductStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNPUBLISHED';

interface ProductDetailModalProps {
    product: AdminProduct;
    onClose: () => void;
    onApprove: (productId: string) => void;
    onReject: (productId: string, reason: string) => void;
    getStatusBadge: (status: ProductStatus) => JSX.Element;
}

export default function ProductDetailModal({ 
    product, 
    onClose, 
    onApprove, 
    onReject,
    getStatusBadge 
}: ProductDetailModalProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Product Review</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            {product.mainImage?.url ? (
                                <img
                                    src={product.mainImage.url}
                                    alt={product.name}
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                            ) : (
                                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <Package className="w-20 h-20 text-gray-400" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">{product.description || 'No description'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-gray-500">Seller</p>
                                    <p className="text-sm font-medium text-gray-900">{product.sellerId?.businessName || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Category</p>
                                    <p className="text-sm font-medium text-gray-900">{product.categoryId?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Price</p>
                                    <p className="text-sm font-medium text-gray-900">{formatCurrency(product.finalPrice)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Stock</p>
                                    <p className="text-sm font-medium text-gray-900">{product.inStockQuantity}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Status</p>
                                    <div className="mt-1">{getStatusBadge(product.status)}</div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Submitted</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {new Date(product.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {product.rejectionReason && (
                                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                                    <p className="text-xs font-medium text-rose-800">Rejection Reason:</p>
                                    <p className="text-sm text-rose-600 mt-1">{product.rejectionReason}</p>
                                </div>
                            )}

                            {(product.status === 'PENDING' || !product.status) && (
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => onApprove(product._id)}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => {
                                            const reason = prompt('Enter rejection reason:');
                                            if (reason) onReject(product._id, reason);
                                        }}
                                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
