/**
 * Утилиты для обеспечения безопасности в клиентском приложении
 */

import { User } from "../types/auth";

const TOKEN_KEY = "token";
const USER_KEY = "user";
const ROLE_KEY = "role";
const SAVED_PROFILE_KEY = "SAVED_USER_PROFILE";

/**
 * Проверяет целостность и валидность данных пользователя
 * @param userData - Данные пользователя для проверки
 * @returns Объект с результатами проверки и сообщением
 */
export const validateUserData = (
  userData: any
): { valid: boolean; message: string } => {
  if (!userData) {
    return { valid: false, message: "Данные пользователя отсутствуют" };
  }

  // Проверка основных полей
  if (!userData._id && !userData.id) {
    return { valid: false, message: "Отсутствует ID пользователя" };
  }

  if (
    !userData.role ||
    (userData.role !== "user" && userData.role !== "admin")
  ) {
    return { valid: false, message: "Недопустимая роль пользователя" };
  }

  return { valid: true, message: "Данные корректны" };
};

/**
 * Синхронизирует и проверяет данные между токенами и сохраненным профилем
 * @returns Объект с результатами проверки
 */
export const validateAndSyncUserData = (): {
  valid: boolean;
  message: string;
  user: User | null;
} => {
  try {
    // Проверяем токен
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      // Очищаем данные, если токен отсутствует
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(ROLE_KEY);
      localStorage.removeItem(SAVED_PROFILE_KEY);
      return {
        valid: false,
        message: "Отсутствует токен аутентификации",
        user: null,
      };
    }

    // Получаем текущие данные пользователя
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) {
      return {
        valid: false,
        message: "Отсутствуют данные пользователя",
        user: null,
      };
    }

    const user = JSON.parse(userStr);
    const savedProfileStr = localStorage.getItem(SAVED_PROFILE_KEY);

    // Проверяем сохраненный профиль
    if (savedProfileStr) {
      try {
        const savedProfile = JSON.parse(savedProfileStr);

        // Проверяем соответствие ролей
        if (savedProfile.role !== user.role) {
          console.warn("Несоответствие ролей между профилями", {
            основнаяРоль: user.role,
            сохраненнаяРоль: savedProfile.role,
          });

          // Исправляем роль в сохраненном профиле
          savedProfile.role = user.role;
          localStorage.setItem(SAVED_PROFILE_KEY, JSON.stringify(savedProfile));
        }
      } catch (e) {
        console.error("Ошибка при проверке сохраненного профиля:", e);
        localStorage.removeItem(SAVED_PROFILE_KEY);
      }
    }

    // Проверяем роль в отдельном ключе
    const storedRole = localStorage.getItem(ROLE_KEY);
    if (storedRole !== user.role) {
      console.warn("Несоответствие сохраненной роли", {
        рольПользователя: user.role,
        сохраненнаяРоль: storedRole,
      });
      localStorage.setItem(ROLE_KEY, user.role);
    }

    return { valid: true, message: "Данные синхронизированы", user };
  } catch (error) {
    console.error("Ошибка при проверке и синхронизации данных:", error);
    return {
      valid: false,
      message: "Ошибка проверки данных",
      user: null,
    };
  }
};

/**
 * Очищает все данные аутентификации
 */
export const clearAllAuthData = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(SAVED_PROFILE_KEY);
    console.log("Все данные аутентификации успешно очищены");
  } catch (error) {
    console.error("Ошибка при очистке данных аутентификации:", error);
  }
};

/**
 * Проверяет доступ к административным функциям
 * @param user - Данные пользователя
 * @returns true если у пользователя есть права администратора
 */
export const hasAdminAccess = (user: User | null): boolean => {
  if (!user) return false;

  return user.role === "admin";
};

/**
 * Вызывает функцию аудита безопасности
 * @param action - действие пользователя
 * @param details - подробности действия
 */
export const auditSecurityAction = (
  action: string,
  details: Record<string, any>
): void => {
  const timestamp = new Date().toISOString();

  // Получаем текущего пользователя
  try {
    const userStr = localStorage.getItem(USER_KEY);
    const user = userStr ? JSON.parse(userStr) : null;

    const auditEntry = {
      action,
      timestamp,
      userId: user?._id || user?.id || "неизвестный",
      role: user?.role || "нет",
      details,
    };

    console.warn("АУДИТ БЕЗОПАСНОСТИ:", auditEntry);

    // Здесь можно добавить отправку на сервер для логирования
  } catch (e) {
    console.error("Ошибка при аудите безопасности:", e);
  }
};
