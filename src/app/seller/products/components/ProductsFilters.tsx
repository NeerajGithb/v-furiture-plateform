import { Search, Filter } from 'lucide-react';

interface ProductsFiltersProps {
  statusFilter: string;
  onStatusFilter: (status: string) => void;
  searchQuery: string;
  onSearchChange: (search: string) => void;
  sortBy: string;
  sortOrder: string;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

export function ProductsFilters({
  statusFilter,
  onStatusFilter,
  searchQuery,
  onSearchChange,
  sortBy,
  sortOrder,
  onSortChange
}: ProductsFiltersProps) {
  const statusOptions = [
    { value: 'all', label: 'All Products' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const sortOptions = [
    { value: 'updatedAt-desc', label: 'Recently Updated' },
    { value: 'createdAt-desc', label: 'Recently Created' },
    { value: 'name-asc', label: 'Name A-Z' },
    { value: 'name-desc', label: 'Name Z-A' },
    { value: 'finalPrice-asc', label: 'Price Low to High' },
    { value: 'finalPrice-desc', label: 'Price High to Low' }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [newSortBy, newSortOrder] = e.target.value.split('-');
            onSortChange(newSortBy, newSortOrder as 'asc' | 'desc');
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Filter Icon */}
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Filter className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}