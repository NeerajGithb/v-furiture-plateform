import { ArrowLeft, Save, Loader2 } from 'lucide-react';

interface ProductFormHeaderProps {
  isEditMode: boolean;
  isUpdating: boolean;
  isFormValid: boolean;
  hasUnsavedChanges: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export function ProductFormHeader({
  isEditMode,
  isUpdating,
  isFormValid,
  hasUnsavedChanges,
  onBack,
  onSubmit
}: ProductFormHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 py-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode ? 'Update your product information' : 'Create a new product listing'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              Unsaved changes
            </span>
          )}
          
          <button
            onClick={onSubmit}
            disabled={!isFormValid || isUpdating}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditMode ? 'Update Product' : 'Create Product'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}