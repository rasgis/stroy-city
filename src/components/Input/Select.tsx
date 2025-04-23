import React, { SelectHTMLAttributes, ReactNode, forwardRef } from "react";
import styles from "./Input.module.css";
import classNames from "classnames";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
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
   * Опции для выбора
   */
  options: SelectOption[];

  /**
   * Текст для пустого значения
   */
  placeholder?: string;

  /**
   * Дополнительный CSS класс
   */
  className?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      size = "medium",
      options,
      placeholder,
      className,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    const selectClassName = classNames(
      styles.input,
      styles.select,
      styles[size],
      {
        [styles.error]: hasError,
      },
      className
    );

    return (
      <div className={styles.inputContainer}>
        {label && <label className={styles.label}>{label}</label>}

        <select ref={ref} className={selectClassName} {...props}>
          {placeholder && (
            <option value="" disabled={props.required}>
              {placeholder}
            </option>
          )}

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {hasError && <div className={styles.errorMessage}>{error}</div>}
        {!hasError && helperText && (
          <div className={styles.helperText}>{helperText}</div>
        )}
      </div>
    );
  }
);
