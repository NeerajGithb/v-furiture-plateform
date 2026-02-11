interface BulkAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

interface BulkActionsBarProps {
  selectedCount: number;
  actions: BulkAction[];
  onCancel: () => void;
}

const variantStyles = {
  default: 'text-gray-900 hover:text-gray-700 hover:bg-gray-100',
  success: 'text-gray-900 hover:text-green-700 hover:bg-green-50',
  warning: 'text-gray-900 hover:text-amber-700 hover:bg-amber-50',
  danger: 'text-gray-900 hover:text-red-700 hover:bg-red-50',
};

export function BulkActionsBar({ selectedCount, actions, onCancel }: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg flex items-center justify-between flex-wrap gap-3">
      <p className="text-sm font-medium text-gray-700">
        {selectedCount} selected
      </p>
      <div className="flex items-center gap-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50 ${
              variantStyles[action.variant || 'default']
            }`}
          >
            {action.label}
          </button>
        ))}
        <div className="h-4 w-px bg-gray-300 mx-1"></div>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-gray-500 hover:text-gray-900 rounded text-sm font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
