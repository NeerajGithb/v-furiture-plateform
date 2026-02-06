import { Eye, Heart, ShoppingCart, Image as ImageIcon } from 'lucide-react';
import { AdminProduct } from '@/types/adminProduct';

interface ProductSidebarProps {
  product: AdminProduct;
}

export default function ProductSidebar({ product }: ProductSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Main Image */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Product Images
        </h3>
        {product.mainImage?.url ? (
          <img
            src={product.mainImage.url}
            alt={product.mainImage.alt || product.name}
            className="w-full h-64 object-cover rounded border"
          />
        ) : (
          <div className="w-full h-64 bg-gray-100 rounded border flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
        {product.galleryImages && product.galleryImages.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {product.galleryImages.slice(0, 6).map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt={img.alt || `Gallery ${idx + 1}`}
                className="w-full h-20 object-cover rounded border"
              />
            ))}
          </div>
        )}
      </div>

      {/* Analytics */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Analytics</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Views
            </span>
            <span className="font-medium">{product.viewCount || 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Wishlist
            </span>
            <span className="font-medium">{product.wishlistCount || 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Sold
            </span>
            <span className="font-medium">{product.totalSold || 0}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Rating</span>
            <span className="font-medium">{product.reviews?.average?.toFixed(1) || '0.0'} ({product.reviews?.count || 0})</span>
          </div>
        </div>
      </div>
    </div>
  );
}