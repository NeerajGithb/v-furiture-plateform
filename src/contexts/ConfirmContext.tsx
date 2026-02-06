'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface ConfirmOptions {
  title: string;
  message: string;
  type?: 'delete' | 'update' | 'confirm' | 'cancel';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

interface ConfirmProviderProps {
  children: ReactNode;
}

export const ConfirmProvider: React.FC<ConfirmProviderProps> = ({ children }) => {
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    options: null,
    isLoading: false,
  });

  const confirm = (options: ConfirmOptions) => {
    setConfirmState({
      isOpen: true,
      options,
      isLoading: false,
    });
  };

  const handleConfirm = async () => {
    if (!confirmState.options) return;

    setConfirmState(prev => ({ ...prev, isLoading: true }));

    try {
      await confirmState.options.onConfirm();
      setConfirmState({ isOpen: false, options: null, isLoading: false });
    } catch (error) {
      // Keep modal open on error, stop loading
      setConfirmState(prev => ({ ...prev, isLoading: false }));
      console.error('Confirmation action failed:', error);
    }
  };

  const handleCancel = () => {
    if (confirmState.options?.onCancel) {
      confirmState.options.onCancel();
    }
    setConfirmState({ isOpen: false, options: null, isLoading: false });
  };

  const handleClose = () => {
    if (!confirmState.isLoading) {
      handleCancel();
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      
      {confirmState.options && (
        <ConfirmationModal
          isOpen={confirmState.isOpen}
          onClose={handleClose}
          onConfirm={handleConfirm}
          title={confirmState.options.title}
          message={confirmState.options.message}
          type={confirmState.options.type || 'confirm'}
          confirmText={confirmState.options.confirmText}
          cancelText={confirmState.options.cancelText}
          isLoading={confirmState.isLoading}
        />
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = (): ConfirmContextType => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};