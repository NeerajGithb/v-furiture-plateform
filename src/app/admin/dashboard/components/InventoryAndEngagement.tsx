import { PackageCheck, Package, AlertCircle, PackageX, UserCheck, UserX, ShoppingBag, Heart } from 'lucide-react';
import { InventoryAndEngagementProps } from '@/types';

export default function InventoryAndEngagement({ products, users, engagement }: InventoryAndEngagementProps) {
  const inventoryItems = [
    { label: 'Published', value: products.published, icon: PackageCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Draft', value: products.draft, icon: Package, color: 'text-gray-600', bg: 'bg-gray-50' },
    { label: 'Low Stock', value: products.lowStock, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Out of Stock', value: products.outOfStock, icon: PackageX, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const engagementItems = [
    { label: 'Verified Users', value: users.verified, icon: UserCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Unverified Users', value: users.unverified, icon: UserX, color: 'text-gray-600', bg: 'bg-gray-50' },
    { label: 'Added to Cart', value: engagement.totalAddedToCart, icon: ShoppingBag, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Added to Wishlist', value: engagement.totalAddedToWishlist, icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Inventory */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="text-base font-bold text-gray-900 mb-4">Inventory Status</h3>
        <div className="grid grid-cols-2 gap-4">
          {inventoryItems.map((item) => (
            <div key={item.label} className="p-3 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-md ${item.bg}`}>
                  <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase">{item.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{item.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="text-base font-bold text-gray-900 mb-4">User Engagement</h3>
        <div className="space-y-3">
          {engagementItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.bg}`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
