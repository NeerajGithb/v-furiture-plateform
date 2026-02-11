import { MapPin } from 'lucide-react';
import { ShippingAddressProps } from '@/types/seller/orders';

export function ShippingAddress({ shippingAddress }: ShippingAddressProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5" />
        Shipping Address
      </h3>
      <div className="text-sm text-gray-700 space-y-1">
        <p className="font-medium">{shippingAddress.fullName}</p>
        <p>{shippingAddress.addressLine1}</p>
        {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
        <p>
          {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}
        </p>
        <p>{shippingAddress.country}</p>
      </div>
    </div>
  );
}
