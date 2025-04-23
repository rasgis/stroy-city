import React, { ReactNode } from "react";
import styles from "./FormGroup.module.css";

export interface FormGroupProps {
  /**
   * Название поля
   */
  label?: string;

  /**
   * Дочерние элементы (поля ввода)
   */
  children: ReactNode;

  /**
   * Текст ошибки (если есть)
   */
  error?: string | null;

  /**
   * Дополнительный CSS класс для контейнера
   */
  className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  label,
  children,
  error,
  className,
}) => {
  return (
    <div className={`${styles.formGroup} ${className || ""}`}>
      {label && <label className={styles.label}>{label}</label>}
      {children}
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};
