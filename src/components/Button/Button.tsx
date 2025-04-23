import React, { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";
import classNames from "classnames";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "warning" | "success" | "text";

  size?: "small" | "medium" | "large";

  fullWidth?: boolean;

  isLoading?: boolean;

  startIcon?: ReactNode;

  endIcon?: ReactNode;

  children?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
  fullWidth = false,
  isLoading = false,
  startIcon,
  endIcon,
  children,
  className,
  disabled,
  ...props
}) => {
  // Добавляем классы в зависимости от пропсов
  const buttonClasses = classNames(
    styles.button,
    styles[variant],
    styles[size],
    {
      [styles.fullWidth]: fullWidth,
      [styles.withIconLeft]: startIcon,
      [styles.withIconRight]: endIcon,
    },
    className
  );

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className={styles.loaderContainer}>
          <span className={styles.loader}></span>
        </span>
      ) : (
        <>
          {startIcon && <span className={styles.iconLeft}>{startIcon}</span>}
          {children}
          {endIcon && <span className={styles.iconRight}>{endIcon}</span>}
        </>
      )}
    </button>
  );
};
