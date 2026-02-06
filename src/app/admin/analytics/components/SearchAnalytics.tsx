import { Search, BarChart3 } from 'lucide-react';
import { SearchAnalyticsProps } from '@/types';

export default function SearchAnalytics({ search }: SearchAnalyticsProps) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <h2 className="text-base font-bold text-gray-900 mb-3">Search Analytics (7 Days)</h2>
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-gray-700">Total Searches</span>
          </div>
          <span className="text-sm font-bold text-gray-900">{search.totalSearches.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-indigo-50 rounded-lg border border-indigo-200">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-medium text-gray-700">Unique Queries</span>
          </div>
          <span className="text-sm font-bold text-gray-900">{search.uniqueQueries.toLocaleString()}</span>
        </div>
      </div>
      <div>
        <h3 className="text-xs font-semibold text-gray-700 mb-2">Top Searches</h3>
        <div className="space-y-1">
          {search.topSearches.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-xs p-1.5 hover:bg-gray-50 rounded">
              <span className="text-gray-700 truncate flex-1">{item.query}</span>
              <span className="text-gray-500 ml-2 font-medium">{item.count}x</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
