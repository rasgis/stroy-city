import { useEffect } from "react";
import { useAppSelector } from "./redux";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";

export const useAuth = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const role = user?.role || "user";

  const isAdmin = isAuthenticated && role === "admin";

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
    role: isValidRole ? role : "user",
  };
};

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
