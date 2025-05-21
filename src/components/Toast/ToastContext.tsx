import React, { createContext, useState, useContext, ReactNode } from 'react';
import Toast from './Toast';

interface ToastContextProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    duration: number;
    id: number;
  } | null>(null);

  const showToast = (
    message: string, 
    type: 'success' | 'error' | 'info' = 'info', 
    duration: number = 3000
  ) => {
    setToast({
      message,
      type,
      duration,
      id: Date.now() // Utiliser un timestamp comme ID unique
    });
  };

  const handleClose = () => {
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={handleClose}
          key={toast.id}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextProps => {
  const context = useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};