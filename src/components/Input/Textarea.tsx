import React, { TextareaHTMLAttributes, forwardRef } from "react";
import styles from "./Input.module.css";
import classNames from "classnames";

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  /**
   * Текст метки поля
   */
  label?: string;

  /**
   * Вспомогательный текст под полем
   */
  helperText?: string;

  /**
   * Текст ошибки (если есть)
   */
  error?: string | null;

  /**
   * Размер поля ввода
   */
  size?: "small" | "medium" | "large";

  /**
   * Дополнительный CSS класс
   */
  className?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, size = "medium", className, ...props }, ref) => {
    const hasError = !!error;

    const textareaClassName = classNames(
      styles.input,
      styles.textarea,
      styles[size],
      {
        [styles.error]: hasError,
      },
      className
    );

    return (
      <div className={styles.inputContainer}>
        {label && <label className={styles.label}>{label}</label>}

        <textarea ref={ref} className={textareaClassName} {...props} />

        {hasError && <div className={styles.errorMessage}>{error}</div>}
        {!hasError && helperText && (
          <div className={styles.helperText}>{helperText}</div>
        )}
      </div>
    );
  }
);
