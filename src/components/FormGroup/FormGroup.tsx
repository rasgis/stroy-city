import React, { ReactNode } from "react";
import styles from "./FormGroup.module.css";

export interface FormGroupProps {
  label?: string;
  children: ReactNode;
  error?: string | null;
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
