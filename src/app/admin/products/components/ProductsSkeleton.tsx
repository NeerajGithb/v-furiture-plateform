export default function ProductsSkeleton() {
  return (
    <div className="p-4 bg-gray-50 min-h-screen animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-4">
        <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-96 bg-gray-200 rounded"></div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-3 border-l-4 border-gray-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 w-16 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 w-12 bg-gray-200 rounded"></div>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="bg-white rounded-lg shadow-sm mb-4">
        <div className="border-b border-gray-200">
          <div className="flex space-x-6 px-4 overflow-x-auto">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="py-3 px-1">
                <div className="h-5 w-24 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Filters Skeleton */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
            </div>
            <div className="w-32">
              <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['', 'Product', 'Seller', 'Status', 'Price', 'Stock', 'Actions'].map((_, i) => (
                  <th key={i} className="px-4 py-3 text-left">
                    <div className="h-4 w-16 bg-gray-300 rounded"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(10)].map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3">
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-300 rounded"></div>
                      <div className="flex-1">
                        <div className="h-5 w-32 bg-gray-300 rounded mb-1"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-20 bg-gray-300 rounded"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-12 bg-gray-300 rounded"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-8 bg-gray-300 rounded"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-gray-300 rounded"></div>
                      <div className="h-6 w-16 bg-gray-300 rounded"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Skeleton */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 w-8 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-8 w-16 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}