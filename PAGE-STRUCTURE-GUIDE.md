# Page Structure Guide

## 📁 File Structure Pattern

```
src/
├── app/[role]/[feature]/
│   ├── page.tsx                    # Main page - data fetching only
│   └── components/
│       ├── [Feature]Stats.tsx     # Stats component with loading
│       ├── [Feature]List.tsx      # List component (pure)
│       └── [Feature]Modal.tsx     # Modal component (pure)
├── hooks/[role]/
│   └── use[Feature].ts             # Data fetching hooks
├── services/[role]/
│   └── [feature]Service.ts        # API service layer
├── stores/[role]/
│   └── [feature]Store.ts          # UI state management
├── lib/domain/[role]/[feature]/
│   ├── [Feature]Service.ts        # Business logic
│   ├── [Feature]Repository.ts     # Data access
│   ├── I[Feature]Repository.ts    # Interface
│   ├── [Feature]Schemas.ts        # Validation schemas
│   └── [Feature]Errors.ts         # Domain errors
└── app/api/[role]/[feature]/
    └── route.ts                    # API endpoints
```

## 🔄 Data Flow

```
Page → Hook → Service → API → Domain → Repository → Database
```

## 📋 Implementation Checklist

### 1. **Main Page** (`page.tsx`)
- ✅ Use `LoaderGuard` for initial loading (includes layout wrapper)
- ✅ Centralize ALL data fetching
- ✅ Pass data + loading states to components
- ✅ Handle pagination with global `Pagination` component
- ✅ Use global hooks (`useConfirm`, `useConfirmUserStatus`)
- ✅ Use Zustand store for UI state (pagination, modals)
- ✅ Use correct selector pattern: `const value = useStore(s => s.value)`
- ❌ No comments in pages or components
- ❌ No manual layout wrapper (`<div className="space-y-6 max-w-7xl mx-auto p-6">`)
- ❌ No page headers (title, description, refresh buttons) - keep pages minimal
- ❌ No filter logic in pages (search, status filters) - components handle filtering
- ❌ No default data structures in pages - components handle their own empty states
- ❌ **NEVER use `any` type** - always create proper TypeScript interfaces in `@/types` directory
- ❌ **CRITICAL**: ALWAYS check TypeScript errors after every file edit and fix immediately

### 2. **Components** (`components/`)
- ✅ Pure components - receive data as props
- ✅ Handle own loading skeletons
- ✅ No data fetching inside components
- ✅ Use callback props for actions
- ✅ Reset state when props change (useEffect with dependencies)
- ✅ Proper TypeScript - no `any` types
- ✅ Use proper keys for lists (avoid index, use timestamp/id)
- ✅ Basic accessibility (ESC key, aria attributes)
- ❌ No comments in components

### 3. **Hooks** (`hooks/[role]/`)
- ✅ Use React Query for caching
- ✅ Return data, loading, error states
- ✅ Handle mutations with toast notifications
- ✅ No try/catch - errors handled in hooks

### 4. **Services** (`services/[role]/`)
- ✅ Extend `BasePrivateService`
- ✅ Use merged API routes with action parameters
- ✅ Return domain types, not API types
- ✅ Handle API response unwrapping

### 5. **Stores** (`stores/[role]/`)
- ✅ Use Zustand for UI state only (not server data)
- ✅ Handle pagination, modals, filters
- ✅ Proper naming (`clearSelectedUser` not `resetModal`)
- ✅ Safe setters (`Math.max(1, page)` for pagination)
- ✅ Access with selectors: `const value = useStore(s => s.value)`

### 6. **Domain Layer** (`lib/domain/[role]/[feature]/`)
- ✅ Keep only essential business methods
- ✅ Validate inputs with Zod schemas
- ✅ Throw domain-specific errors
- ✅ Repository pattern for data access

### 7. **API Routes** (`app/api/[role]/[feature]/`)
- ✅ Merge actions into single route with `?action=` parameter
- ✅ Use domain service, not direct repository
- ✅ Middleware: auth → db → error handling
- ✅ No duplicate validation (domain handles it)

## 🎯 Key Principles

1. **Single Responsibility**: Each layer has one job
2. **Data Down, Events Up**: Props flow down, callbacks up
3. **Global Components**: Reuse `LoaderGuard`, `Pagination`, `useConfirm`
4. **No Duplication**: Domain validates, API routes delegate
5. **Clean Architecture**: Page → Hook → Service → Domain → Repository
6. **Type Safety**: No `any` types, proper interfaces
7. **UX First**: Reset state, proper keys, accessibility
8. **No Comments**: Code should be self-explanatory

## 📝 Quick Template

```tsx
// page.tsx
export default function [Feature]Page() {
  const currentPage = use[Feature]UIStore(s => s.currentPage);
  const setCurrentPage = use[Feature]UIStore(s => s.setCurrentPage);
  
  const { data, isLoading, error } = use[Feature]({ page: currentPage });
  
  return (
    <LoaderGuard isLoading={isLoading} error={error}>
      <[Feature]Stats stats={data?.stats} isLoading={statsLoading} />
      <[Feature]List items={data?.items} onAction={handleAction} />
      <Pagination pagination={data?.pagination} onPageChange={setCurrentPage} />
    </LoaderGuard>
  );
}
```

## 🚀 Migration Steps

1. update domain layer (service, repository, schemas)
2. update API route with merged actions
3. Update service to use domain types
4. Update Zustand store for UI state
5. Update hooks to handle new service
6. Update page to centralize data fetching + use store
7. Update components to be pure (props only)
8. Use global components (LoaderGuard, Pagination)

## ⚠️ Common Pitfalls to Avoid

1. **Store destructuring**: Use `const value = useStore(s => s.value)` not `const { value } = useStore()`
2. **Any types**: Always create proper interfaces in `@/types` directory - NEVER use `any` type
3. **Index keys**: Use stable keys for lists
4. **State not resetting**: Add useEffect to reset component state
5. **Comments**: Remove all comments from pages/components
6. **Manual layout**: LoaderGuard handles layout wrapper
7. **Early returns**: Keep modals mounted, show loading inside
8. **Unsafe setters**: Add validation (`Math.max(1, page)`)
9. **Default data in pages**: Don't create default data structures in pages - components should handle their own empty states
10. **Empty arrays in pages**: Don't pass empty arrays like `mostViewed={[]}` - pass undefined and let components handle empty states
11. **Using `any` type**: NEVER use `any` type - always create proper TypeScript interfaces in `@/types` directory
12. **Not checking TypeScript errors**: ALWAYS check for TypeScript errors after any file edit - fix them immediately

## 🔍 Quality Checklist

Before marking migration complete:
- [ ] **CRITICAL**: Check TypeScript errors after every file edit and fix immediately
- [ ] No TypeScript errors
- [ ] No `any` types used - proper interfaces created in `@/types` directory
- [ ] Store uses selector pattern
- [ ] Components reset state on prop changes
- [ ] Lists use stable keys
- [ ] Modal has basic accessibility
- [ ] No comments in code
- [ ] LoaderGuard handles layout