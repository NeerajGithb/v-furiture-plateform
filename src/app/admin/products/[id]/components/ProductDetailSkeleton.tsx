export default function ProductDetailSkeleton() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded"></div>
            <div>
              <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
        
        {/* Action Buttons Skeleton */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-20"></div>
            <div className="h-10 bg-gray-200 rounded w-28"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Images & Analytics Skeleton */}
        <div className="space-y-6">
          {/* Images Skeleton */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
            <div className="w-full h-64 bg-gray-200 rounded mb-3"></div>
            <div className="grid grid-cols-3 gap-2">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Analytics Skeleton */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="h-5 bg-gray-200 rounded w-20 mb-3"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-8"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Details Skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Skeleton */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="h-5 bg-gray-200 rounded w-40 mb-3"></div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
              <div className="col-span-2">
                <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>

          {/* Seller Info Skeleton */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="h-5 bg-gray-200 rounded w-36 mb-3"></div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Skeleton */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i}>
                  <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Specifications Skeleton */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="h-5 bg-gray-200 rounded w-28 mb-3"></div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Marketing Skeleton */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
            <div className="space-y-3">
              <div>
                <div className="h-3 bg-gray-200 rounded w-12 mb-1"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-14"></div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-18"></div>
              </div>
            </div>
          </div>

          {/* Timeline Skeleton */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="h-5 bg-gray-200 rounded w-36 mb-3"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}