import { IndianRupee } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { PriceBreakdownProps } from '@/types/seller/orders';

export function PriceBreakdown({ order }: PriceBreakdownProps) {
  // Calculate original price (subtotal + discount)
  const originalPrice = order.subtotal + (order.discount || 0);
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <IndianRupee className="w-5 h-5" />
        Price Breakdown
      </h3>
      <div className="space-y-2">
        {/* Original Price */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Price ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
          <span className="font-medium text-gray-900">{formatCurrency(originalPrice)}</span>
        </div>

        {/* Discount */}
        {order.discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span className="font-medium">-{formatCurrency(order.discount)}</span>
          </div>
        )}

        {/* Subtotal after discount */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">{formatCurrency(order.subtotal)}</span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Delivery Charges</span>
          <span className={`font-medium ${order.shippingCost === 0 ? 'text-green-600' : 'text-gray-900'}`}>
            {order.shippingCost === 0 ? 'FREE' : formatCurrency(order.shippingCost)}
          </span>
        </div>

        {/* Tax */}
        {order.tax > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="font-medium text-gray-900">{formatCurrency(order.tax)}</span>
          </div>
        )}

        <div className="pt-2 border-t border-gray-200"></div>

        {/* Total */}
        <div className="flex justify-between">
          <span className="font-semibold text-gray-900">Total Amount</span>
          <span className="font-bold text-lg text-gray-900">{formatCurrency(order.totalAmount)}</span>
        </div>
        <p className="text-xs text-gray-500">Inclusive of all taxes and charges</p>
      </div>
    </div>
  );
}
