import { useEffect } from "react";
import { useAppSelector } from "./redux";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { User } from "../types/user";

/**
 * Хук для получения данных об аутентификации пользователя
 * С дополнительной проверкой роли для предотвращения несанкционированного доступа
 */
export const useAuth = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Проверяем, что роль установлена корректно
  const role = user?.role || "user";

  // Дополнительная проверка для безопасности - защита от случайного изменения роли
  const isAdmin = isAuthenticated && role === "admin";

  // Защита от недействительных ролей
  const isValidRole = role === "admin" || role === "user";
  if (!isValidRole && user) {
    console.error(
      "ВНИМАНИЕ: Обнаружена недействительная роль пользователя:",
      role
    );
  }

  return {
    isAuthenticated,
    user,
    isAdmin,
    isUser: isAuthenticated && role === "user",
    role: isValidRole ? role : "user", // В случае некорректной роли считаем пользователя обычным
  };
};

/**
 * Хук для защиты маршрутов, доступных только администраторам.
 * Автоматически перенаправляет на страницу ошибки "Доступ запрещен",
 * если пользователь не имеет прав администратора.
 *
 * Используется универсальный компонент ErrorPage с типом "access-denied"
 */
export const useAdminGuard = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) {
      console.warn(
        "Попытка доступа к защищенному маршруту администратора неавторизованным пользователем"
      );
      navigate(ROUTES.ACCESS_DENIED);
    }
  }, [isAdmin, navigate]);

  return isAdmin;
};
