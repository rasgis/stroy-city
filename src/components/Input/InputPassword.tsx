import React, { useState, forwardRef } from "react";
import { InputProps, Input } from "./Input";
import styles from "./Input.module.css";

export type InputPasswordProps = Omit<InputProps, "type">;

export const InputPassword = forwardRef<HTMLInputElement, InputPasswordProps>(
  (props, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className={styles.passwordContainer}>
        <Input {...props} ref={ref} type={showPassword ? "text" : "password"} />

        <button
          type="button"
          className={styles.passwordToggle}
          onClick={togglePasswordVisibility}
          tabIndex={-1}
          aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
        >
          {showPassword ? "👁️" : "👁️‍🗨️"}
        </button>
      </div>
    );
  }
);
