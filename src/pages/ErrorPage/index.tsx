/**
 * Универсальный компонент для отображения страниц ошибок
 * Поддерживает отображение ошибок 404 и 403 (доступ запрещен)
 */
import React, { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { useTheme } from "../../context/ThemeContext";
import styles from "./styles.module.css";

export type ErrorType = "not-found" | "access-denied" | "server-error";

interface ErrorPageProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  code?: string | number;
  actions?: ReactNode;
  showHomeLink?: boolean;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  type = "not-found",
  title,
  message,
  code,
  actions,
  showHomeLink = true,
}) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Анимация появления компонента
  useEffect(() => {
    setMounted(true);
  }, []);

  // Определяем контент на основе типа ошибки
  const getErrorContent = () => {
    switch (type) {
      case "access-denied":
        return {
          code: code || "403",
          title: title || "Доступ запрещен",
          message: message || "У вас нет прав для доступа к этой странице.",
          icon: "🔒",
          color: theme === "dark" ? "#e03b3b" : "#d32f2f",
        };
      case "server-error":
        return {
          code: code || "500",
          title: title || "Ошибка сервера",
          message:
            message ||
            "Произошла ошибка на сервере. Пожалуйста, попробуйте позже.",
          icon: "⚠️",
          color: theme === "dark" ? "#f8bb86" : "#ff9800",
        };
      case "not-found":
      default:
        return {
          code: code || "404",
          title: title || "Страница не найдена",
          message: message || "Извините, запрашиваемая страница не существует.",
          icon: "🔍",
          color: theme === "dark" ? "#0be0b8" : "#0ca591",
        };
    }
  };

  const errorContent = getErrorContent();

  return (
    <div
      className={`
        ${styles.container} 
        ${styles[`theme-${theme}`]} 
        ${mounted ? styles.mounted : ""}
      `}
    >
      {/* Декоративные элементы */}
      <div
        className={styles.decorDot1}
        style={{ background: errorContent.color }}
      ></div>
      <div
        className={styles.decorDot2}
        style={{ background: errorContent.color }}
      ></div>
      <div className={styles.decorLine}></div>

      <div className={styles.errorIcon} style={{ color: errorContent.color }}>
        {errorContent.icon}
      </div>
      <h1 className={styles.errorCode} style={{ color: errorContent.color }}>
        {errorContent.code}
      </h1>
      <h2 className={styles.errorTitle}>{errorContent.title}</h2>
      <p className={styles.errorMessage}>{errorContent.message}</p>

      {/* Дополнительные действия */}
      {actions && <div className={styles.actionsContainer}>{actions}</div>}

      {/* Ссылка на главную */}
      {showHomeLink && (
        <Link to={ROUTES.HOME} className={styles.link}>
          <span className={styles.homeIcon}>🏠</span>
          Вернуться на главную
        </Link>
      )}
    </div>
  );
};

export default ErrorPage;
