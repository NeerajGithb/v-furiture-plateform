import React from 'react';

interface EmptyStateGuardProps {
  total?: number;
  isEmpty?: boolean;
  empty: React.ReactNode;
  filteredEmpty?: React.ReactNode;
  hasFilters?: boolean;
  children: React.ReactNode;
}

export function EmptyStateGuard({ 
  total, 
  isEmpty,
  empty,
  filteredEmpty,
  hasFilters = false,
  children 
}: EmptyStateGuardProps) {
  const shouldShowEmpty = isEmpty !== undefined ? isEmpty : (total !== undefined && total === 0);

  if (shouldShowEmpty) {
    if (hasFilters && filteredEmpty) {
      return <>{filteredEmpty}</>;
    }
    return <>{empty}</>;
  }

  return <>{children}</>;
}
