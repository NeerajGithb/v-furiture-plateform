export default function CouponsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-9 w-28 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Stats Overview Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="py-2 px-1">
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-8 px-4 py-3">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                </th>
                {[...Array(6)].map((_, i) => (
                  <th key={i} className="px-4 py-3">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3">
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="h-2 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}