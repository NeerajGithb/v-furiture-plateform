export default function AnalyticsSkeleton() {
  return (
    <div className="space-y-5">
      {/* Page Title Skeleton */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
        <div>
          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="w-48 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Analytics Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Product Analytics Skeleton */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Search Analytics Skeleton */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Status Breakdown Skeleton */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="w-40 h-6 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto animate-pulse mb-2" />
              <div className="w-12 h-4 bg-gray-200 rounded animate-pulse mx-auto mb-1" />
              <div className="w-8 h-3 bg-gray-200 rounded animate-pulse mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Metrics Skeleton */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="w-36 h-6 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto animate-pulse mb-3" />
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse mx-auto mb-1" />
              <div className="w-12 h-3 bg-gray-200 rounded animate-pulse mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}