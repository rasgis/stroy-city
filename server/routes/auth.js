import express from "express";
import { register, login } from "../controllers/authController.js";
import { getUserProfile, updateUserProfile } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

export const authRoutes = express.Router();

// Добавляем middleware для логирования запросов
const logRequests = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
};

// Применяем middleware логирования ко всем маршрутам
authRoutes.use(logRequests);

// Маршруты аутентификации
authRoutes.post("/register", register);
authRoutes.post("/login", login);

// Отдельный обработчик для PUT /profile для отладки
authRoutes.put("/profile", (req, res, next) => {
  console.log("Получен запрос PUT /api/auth/profile");
  console.log("Заголовки:", req.headers);
  console.log("Тело запроса:", req.body);
  protect(req, res, () => {
    console.log("Пользователь аутентифицирован, передаем управление updateUserProfile");
    updateUserProfile(req, res);
  });
});

// Маршрут GET /profile
authRoutes.get("/profile", protect, getUserProfile);
