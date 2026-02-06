import { AlertTriangle, Save, Loader2 } from 'lucide-react';

interface ConfirmationModalsProps {
  showSaveConfirm: boolean;
  showExitConfirm: boolean;
  productDataToSave: any;
  isUpdating: boolean;
  onConfirmSave: () => void;
  onCancelSave: () => void;
  onConfirmExit: () => void;
  onCancelExit: () => void;
}

export function ConfirmationModals({
  showSaveConfirm,
  showExitConfirm,
  productDataToSave,
  isUpdating,
  onConfirmSave,
  onCancelSave,
  onConfirmExit,
  onCancelExit
}: ConfirmationModalsProps) {
  return (
    <>
      {/* Save Confirmation Modal */}
      {showSaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <Save className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Save</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to save this product? 
              {productDataToSave?.isPublished && ' It will be published and visible to customers.'}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancelSave}
                disabled={isUpdating}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirmSave}
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Product'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              <h3 className="text-lg font-semibold text-gray-900">Unsaved Changes</h3>
            </div>
            <p className="text-gray-600 mb-4">
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancelExit}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Stay
              </button>
              <button
                onClick={onConfirmExit}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Leave Without Saving
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}