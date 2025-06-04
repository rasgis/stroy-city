import React, { useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";
import styles from "./ThemeToggle.module.css";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    toggleTheme();

    if (buttonRef.current) {
      buttonRef.current.blur();
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className={styles.toggleButton}
      aria-label={
        theme === "dark"
          ? "Переключить на светлую тему"
          : "Переключить на темную тему"
      }
      title={theme === "dark" ? "Светлая тема" : "Темная тема"}
      tabIndex={0}
    >
      {theme === "dark" ? (
        <FaSun className={`${styles.icon} ${styles.sunIcon}`} />
      ) : (
        <FaMoon className={`${styles.icon} ${styles.moonIcon}`} />
      )}
    </button>
  );
};

export default ThemeToggle;
