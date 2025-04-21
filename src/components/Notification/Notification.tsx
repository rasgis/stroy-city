import React, { useCallback, useEffect } from 'react';
import styles from './Notification.module.css';

interface NotificationProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  autoHideDuration?: number;
}

export const Notification: React.FC<NotificationProps> = ({
  message,
  isOpen,
  onClose,
  autoHideDuration = 3000
}) => {
  // Автоматическое закрытие уведомления после указанного времени
  useEffect(() => {
    if (isOpen && autoHideDuration) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [isOpen, autoHideDuration, onClose]);

  // Обработчик для закрытия уведомления по клику на кнопку
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.notification}>
      <div className={styles.content}>
        {message}
        <button
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Закрыть"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification; 