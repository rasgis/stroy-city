import React from "react";
import styles from "./Modal.module.css";
import CloseIcon from "@mui/icons-material/Close";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "default" | "delete";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  type = "default",
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBody}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button onClick={onClose} className={styles.modalClose}>
            <CloseIcon fontSize="small" />
          </button>
        </div>
        <div className={styles.modalContent}>{children}</div>
        {onConfirm && (
          <div className={styles.modalFooter}>
            <button onClick={onClose} className={styles.cancelButton}>
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`${styles.confirmButton} ${
                type === "delete" ? styles.deleteButton : ""
              }`}
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
