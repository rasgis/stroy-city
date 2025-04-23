import React, { InputHTMLAttributes, ReactNode, forwardRef } from "react";
import styles from "./Input.module.css";
import classNames from "classnames";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
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
   * Иконка слева от текста
   */
  startIcon?: ReactNode;

  /**
   * Функция очистки поля
   */
  onClear?: () => void;

  /**
   * Дополнительный CSS класс
   */
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      size = "medium",
      startIcon,
      onClear,
      className,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    const inputClassName = classNames(
      styles.input,
      styles[size],
      {
        [styles.error]: hasError,
        [styles.withIcon]: !!startIcon,
        [styles.withClearButton]: !!onClear,
      },
      className
    );

    return (
      <div className={styles.inputContainer}>
        {label && <label className={styles.label}>{label}</label>}

        <div className={styles.inputWrapper}>
          {startIcon && <span className={styles.icon}>{startIcon}</span>}

          <input ref={ref} className={inputClassName} {...props} />

          {onClear && props.value && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={onClear}
              aria-label="Очистить"
            >
              ×
            </button>
          )}
        </div>

        {hasError && <div className={styles.errorMessage}>{error}</div>}
        {!hasError && helperText && (
          <div className={styles.helperText}>{helperText}</div>
        )}
      </div>
    );
  }
);
