import React, { useEffect, useState } from 'react';
import styles from './Toast.module.css';

interface ToastProps {
  message: string;
  duration?: number;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  duration = 3000, 
  type = 'info', 
  onClose 
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) {
        setTimeout(onClose, 300); // Délai pour l'animation de sortie
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!message) return null;

  return (
    <div 
      className={`${styles.toast} ${styles[type]} ${visible ? styles.visible : styles.hidden}`}
      role="alert"
    >
      <div className={styles.message}>{message}</div>
    </div>
  );
};

export default Toast;