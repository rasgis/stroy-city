import { useEffect } from "react";
import { useAppSelector } from "./useAppSelector";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";

export const useAuth = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  return {
    isAuthenticated,
    user,
    isAdmin: isAuthenticated && user?.role === "admin",
    isUser: isAuthenticated && user?.role === "user",
  };
};

/**
 * Хук для защиты маршрутов, доступных только администраторам.
 * Автоматически перенаправляет на страницу "доступ запрещен", если пользователь
 * не администратор.
 */
export const useAdminGuard = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/access-denied");
    }
  }, [isAdmin, navigate]);

  return isAdmin;
};
