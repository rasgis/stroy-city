import React, { useEffect, useState } from "react";
import { useAppDispatch } from "../hooks";
import { authService } from "../services/authService";
import { updateUserData } from "../reducers/authSlice";
import {
  validateAndSyncUserData,
  auditSecurityAction,
  TOKEN_KEY,
  USER_KEY,
  ROLE_KEY,
  SAVED_PROFILE_KEY,
} from "../utils/securityUtils";

/**
 * Компонент безопасности для проверки и защиты от эскалации привилегий
 * при загрузке страницы и изменении данных пользователя
 */
const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const [isSecurityChecked, setIsSecurityChecked] = useState(false);

  useEffect(() => {
    const performSecurityCheck = () => {
      try {
        // Проверяем и синхронизируем данные пользователя
        const { valid, message, user } = validateAndSyncUserData();

        if (!valid) {
          console.warn("Проверка безопасности не пройдена:", message);
          // Если проверка не пройдена и есть пользователь, выполняем выход
          if (localStorage.getItem(TOKEN_KEY)) {
            authService.clearAuthData();
          }
        } else if (user) {
          // Обновляем пользователя в Redux
          dispatch(updateUserData(user));

          // Логируем успешную проверку
          auditSecurityAction("security-check-success", {
            userId: user._id || user.id,
            role: user.role,
          });
        }

        // Отмечаем, что проверка выполнена
        setIsSecurityChecked(true);
      } catch (error) {
        console.error("Критическая ошибка при проверке безопасности:", error);
        // В случае ошибки для безопасности очищаем все данные
        authService.clearAuthData();
        setIsSecurityChecked(true);

        auditSecurityAction("security-check-error", {
          error: error instanceof Error ? error.message : "Неизвестная ошибка",
        });
      }
    };

    performSecurityCheck();

    // Добавляем обработчик для проверки при возвращении на вкладку
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        performSecurityCheck();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Добавляем обработчик события storage для контроля изменений в других вкладках
    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key &&
        [TOKEN_KEY, USER_KEY, ROLE_KEY, SAVED_PROFILE_KEY].includes(event.key)
      ) {
        performSecurityCheck();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch]);

  // Если проверка безопасности не завершена, не рендерим дочерние компоненты
  if (!isSecurityChecked) {
    return null;
  }

  return <>{children}</>;
};

export default SecurityProvider;
