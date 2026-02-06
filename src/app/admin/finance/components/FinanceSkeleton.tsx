export default function FinanceSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="w-32 h-6 bg-gray-100 rounded animate-pulse" />
            <div className="w-48 h-4 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32 h-9 bg-gray-100 rounded-lg animate-pulse" />
          <div className="w-24 h-9 bg-gray-100 rounded-lg animate-pulse" />
          <div className="w-32 h-9 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Finance Cards Skeleton (Big Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-24 h-4 bg-gray-100 rounded animate-pulse" />
              <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse" />
            </div>
            <div className="w-28 h-8 bg-gray-100 rounded animate-pulse mb-2" />
            <div className="w-20 h-3 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Stats Summary Skeleton (Small Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
            <div className="space-y-2">
              <div className="w-20 h-3 bg-gray-100 rounded animate-pulse" />
              <div className="w-16 h-6 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>

      {/* Transactions Table Skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="w-40 h-5 bg-gray-100 rounded animate-pulse" />
          <div className="w-24 h-4 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[...Array(8)].map((_, i) => (
                  <th key={i} className="px-4 py-3">
                    <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(8)].map((_, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="w-20 h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}