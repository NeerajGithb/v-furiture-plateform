import { CreditCard } from 'lucide-react';
import { SearchAndPaymentProps } from '@/types';

export default function SearchAndPayment({ search, paymentMethods }: SearchAndPaymentProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Search Queries */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Top Search Queries</h3>
        <div className="space-y-3">
          {search.topSearches.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No search data</p>
          ) : (
            search.topSearches.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 flex items-center justify-center text-xs font-medium bg-gray-100 text-gray-600 rounded">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-900 font-medium">{item.query}</span>
                </div>
                <span className="text-xs font-medium bg-gray-50 text-gray-600 px-2 py-1 rounded-full">
                  {item.count} searches
                </span>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total</p>
            <p className="text-lg font-bold text-gray-900">{search.totalSearches}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Unique</p>
            <p className="text-lg font-bold text-gray-900">{search.uniqueQueries}</p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Payment Methods</h3>
        <div className="space-y-4">
          {Object.keys(paymentMethods).length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No payment data</p>
          ) : (
            Object.entries(paymentMethods)
              .sort(([, a], [, b]) => b - a)
              .map(([method, count]) => {
                const total = Object.values(paymentMethods).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
                return (
                  <div key={method} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900 capitalize">{method}</span>
                      </div>
                      <span className="text-gray-500">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-900 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}
