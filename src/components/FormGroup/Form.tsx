import React, { ReactNode, FormEvent } from "react";
import styles from "./FormGroup.module.css";

export interface FormProps {
  /**
   * Обработчик отправки формы
   */
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;

  /**
   * Заголовок формы
   */
  title?: string;

  /**
   * Дочерние элементы формы
   */
  children: ReactNode;

  /**
   * Дополнительный CSS класс для компонента
   */
  className?: string;

  /**
   * Кнопки формы или другие действия
   */
  actions?: ReactNode;

  /**
   * Текст ошибки (если есть)
   */
  error?: string | null;

  /**
   * ID формы
   */
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
