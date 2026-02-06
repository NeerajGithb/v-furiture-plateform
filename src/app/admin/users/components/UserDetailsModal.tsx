import React, { useState, useEffect } from 'react';
import { AdminUser } from '@/lib/domain/admin/users/IAdminUsersRepository';
import { Loader } from '@/components/ui/Loader';
import { formatDate } from '@/utils/formatDate';
import { 
  X, 
  Mail, 
  MailCheck, 
  Calendar, 
  ShoppingBag, 
  MessageSquare,
  Plus
} from 'lucide-react';

interface Order {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string | Date;
}

interface UserDetailsModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  user?: AdminUser;
  orders?: Order[];
  isUserLoading: boolean;
  isOrdersLoading: boolean;
  onAddNote: (userId: string, note: string) => void;
  isAddingNote: boolean;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  userId,
  isOpen,
  onClose,
  user,
  orders,
  isUserLoading,
  isOrdersLoading,
  onAddNote,
  isAddingNote
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'notes'>('profile');
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab('profile');
      setNewNote('');
    }
  }, [userId, isOpen]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    onAddNote(userId, newNote.trim());
    setNewNote('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
           role="dialog"
           aria-modal="true"
      >
        {isUserLoading ? (
          <div className="p-6">
            <Loader />
          </div>
        ) : !user ? (
          <div className="p-6 text-center text-gray-500">
            User not found
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-lg font-medium text-gray-600">
                {user.name?.[0] || user.email[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user.name || 'N/A'}</h2>
              <p className="text-gray-600 flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {user.email}
                {user.emailVerified && <MailCheck className="w-4 h-4 text-green-600" />}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'profile', label: 'Profile', icon: Mail },
              { id: 'orders', label: 'Orders', icon: ShoppingBag },
              { id: 'notes', label: 'Notes', icon: MessageSquare }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'profile' | 'orders' | 'notes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{user.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <p className="text-gray-900">{user.status || 'active'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email Verified</label>
                  <p className="text-gray-900">{user.emailVerified ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Joined</label>
                  <p className="text-gray-900 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(user.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="text-gray-900">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              {isOrdersLoading ? (
                <Loader />
              ) : orders && orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.map((order: Order) => (
                    <div key={order._id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order #{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${order.totalAmount}</p>
                          <p className="text-sm text-gray-600">{order.status}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No orders found</p>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Add Note */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note about this user..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg resize-none"
                    rows={3}
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || isAddingNote}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Note
                  </button>
                </div>
              </div>

              {/* Notes List */}
              {user.notes && user.notes.length > 0 ? (
                <div className="space-y-3">
                  {user.notes.map((noteItem: { note: string; createdAt: Date; createdBy?: string }, index: number) => (
                    <div key={`${noteItem.createdAt}-${index}`} className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-900">{noteItem.note}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {formatDate(noteItem.createdAt)} {noteItem.createdBy && `by ${noteItem.createdBy}`}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No notes added yet</p>
              )}
            </div>
          )}
        </div>
            </>
        )}
      </div>
    </div>
  );
};