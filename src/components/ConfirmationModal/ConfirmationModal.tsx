// components/ConfirmationModal.tsx
import React, { useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';
import styles from './ConfirmationModal.module.css';
import PlateSpinner from '../Spinner/Spinner';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'danger',
  isLoading = false
}) => {
  // Gestion de la fermeture avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return (
          <span className={styles.iconDanger}>
            <AlertTriangle size={24} />
          </span>
        );
      case 'warning':
        return (
          <span className={styles.iconDanger}>
            <AlertTriangle size={24} />
          </span>
        );
      case 'success':
        return (
          <span className={styles.iconSuccess}>
            <CheckCircle size={24} />
          </span>
        );
      case 'info':
      default:
        return (
          <span className={styles.iconInfo}>
            <Info size={24} />
          </span>
        );
    }
  };

  const getModalClass = () => {
    return `${styles.modal} ${styles[`modal${type.charAt(0).toUpperCase() + type.slice(1)}`]}`;
  };

  const getConfirmButtonClass = () => {
    return `${styles.confirmButton} ${styles[`confirmButton${type.charAt(0).toUpperCase() + type.slice(1)}`]}`;
  };

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={getModalClass()}>
        <div className={styles.modalContent}>
          <div className={styles.iconContainer}>
            {getIcon()}
          </div>
          
          <div className={styles.textContent}>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.message}>{message}</p>
          </div>
        </div>
        
        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={getConfirmButtonClass()}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <PlateSpinner/>
                Chargement...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;