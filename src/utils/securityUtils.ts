import { User } from "../types/user";

export const TOKEN_KEY = "auth_token";
export const USER_KEY = "auth_user";
export const ROLE_KEY = "auth_role";
export const SAVED_PROFILE_KEY = "auth_saved_profile";
export const TOKEN_EXPIRY_KEY = "auth_token_expiry";


export const validateUserData = (
  userData: any
): { valid: boolean; message: string } => {
  if (!userData) {
    return { valid: false, message: "Данные пользователя отсутствуют" };
  }

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

export const validateAndSyncUserData = (): {
  valid: boolean;
  message: string;
  user: User | null;
} => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(ROLE_KEY);
      localStorage.removeItem(SAVED_PROFILE_KEY);
      return {
        valid: false,
        message: "Отсутствует токен аутентификации",
        user: null,
      };
    }

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

    if (savedProfileStr) {
      try {
        const savedProfile = JSON.parse(savedProfileStr);

        if (savedProfile.role !== user.role) {
          console.warn("Несоответствие ролей между профилями", {
            основнаяРоль: user.role,
            сохраненнаяРоль: savedProfile.role,
          });

          savedProfile.role = user.role;
          localStorage.setItem(SAVED_PROFILE_KEY, JSON.stringify(savedProfile));
        }
      } catch (e) {
        console.error("Ошибка при проверке сохраненного профиля:", e);
        localStorage.removeItem(SAVED_PROFILE_KEY);
      }
    }

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

export const hasAdminAccess = (user: User | null): boolean => {
  if (!user) return false;

  return user.role === "admin";
};

export const auditSecurityAction = (
  action: string,
  details: Record<string, any>
): void => {
  const timestamp = new Date().toISOString();

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

  } catch (e) {
    console.error("Ошибка при аудите безопасности:", e);
  }
};
