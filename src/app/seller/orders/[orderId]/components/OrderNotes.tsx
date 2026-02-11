import { useState } from 'react';
import { FileText, Edit2, Save, X, Plus, Clock } from 'lucide-react';
import { OrderNotesProps } from '@/types/seller/orders';

export function OrderNotes({ notes: initialNotes, isCancelled, updating, onSave }: OrderNotesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(initialNotes);

  const handleSave = async () => {
    await onSave(notes.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setNotes(initialNotes);
  };

  const handleStartEditing = () => {
    setIsEditing(true);
    setNotes(initialNotes);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 print:hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-500" />
          Internal Notes
        </h3>
        {!isEditing && !isCancelled && (
          <button
            onClick={handleStartEditing}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium"
          >
            {initialNotes ? (
              <>
                <Edit2 className="w-4 h-4" />
                Edit Notes
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Notes
              </>
            )}
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add internal notes for this order
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about this order... (e.g., special handling instructions, customer requests, issues encountered, etc.)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
              rows={5}
            />
            <p className="text-xs text-gray-500 mt-1">
              These notes are only visible to you and other sellers. Customers cannot see them.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={updating}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {updating ? 'Saving...' : 'Save Notes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={updating}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {initialNotes ? (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {initialNotes}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Last updated: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-3">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-2">No internal notes added yet</p>
              <p className="text-xs text-gray-400">
                Add notes to keep track of special instructions, issues, or important details about this order.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
