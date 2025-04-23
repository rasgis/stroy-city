/**
 * Компонент переключения темы оформления
 *
 * Используется для переключения между темной и светлой темами.
 * Отображает иконку солнца для темной темы (чтобы переключиться на светлую)
 * и иконку луны для светлой темы (чтобы переключиться на темную).
 */
import React, { useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";
import styles from "./ThemeToggle.module.css";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);

  /**
   * Обрабатывает клик по кнопке переключения темы
   *
   * @param {React.MouseEvent<HTMLButtonElement>} e - Событие клика
   */
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    toggleTheme();

    // Убираем фокус с кнопки после клика
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
