export default function ReviewsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-300 rounded"></div>
          <div>
            <div className="h-8 bg-gray-300 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-64"></div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 bg-gray-300 rounded w-24"></div>
          <div className="h-10 bg-gray-300 rounded w-24"></div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-20"></div>
              </div>
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Rating Breakdown Skeleton */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="h-6 bg-gray-300 rounded w-40 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-16 h-4 bg-gray-300 rounded"></div>
              <div className="flex-1 h-2 bg-gray-300 rounded"></div>
              <div className="w-20 h-4 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation Skeleton */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 px-6 py-4">
              <div className="w-5 h-5 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-16"></div>
              <div className="w-8 h-6 bg-gray-300 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 h-10 bg-gray-300 rounded"></div>
          <div className="h-10 bg-gray-300 rounded w-32"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-200">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div key={star} className="w-4 h-4 bg-gray-300 rounded"></div>
                        ))}
                      </div>
                      <div className="w-16 h-6 bg-gray-300 rounded-full"></div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-2">
                      <div className="h-4 bg-gray-300 rounded w-24"></div>
                      <div className="h-4 bg-gray-300 rounded w-32"></div>
                      <div className="h-4 bg-gray-300 rounded w-20"></div>
                    </div>

                    <div className="h-4 bg-gray-300 rounded w-48 mb-1"></div>
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-16 h-8 bg-gray-300 rounded"></div>
                    <div className="w-16 h-8 bg-gray-300 rounded"></div>
                    <div className="w-8 h-8 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}