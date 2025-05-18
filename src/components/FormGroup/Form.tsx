import React, { ReactNode, FormEvent } from "react";
import styles from "./FormGroup.module.css";

export interface FormProps {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  title?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
  error?: string | null;
  id?: string;
}

export const Form: React.FC<FormProps> = ({
  onSubmit,
  title,
  children,
  className,
  actions,
  error,
  id,
}) => {
  return (
    <div className={`${styles.formContainer} ${className || ""}`}>
      {title && <h2 className={styles.formTitle}>{title}</h2>}

      {error && <div className={styles.formError}>{error}</div>}

      <form id={id} className={styles.form} onSubmit={onSubmit}>
        {children}

        {actions && <div className={styles.formActions}>{actions}</div>}
      </form>
    </div>
  );
};
