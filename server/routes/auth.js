import express from "express";
import {
  register,
  login,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Добавляем middleware для логирования запросов
const logRequests = (req, res, next) => {
  console.log(`[Auth Routes] ${req.method} ${req.originalUrl}`);
  next();
};

// Применяем middleware логирования ко всем маршрутам
router.use(logRequests);

// @desc    Регистрация нового пользователя
// @route   POST /api/auth/register
// @access  Public
router.post("/register", register);

// @desc    Вход пользователя
// @route   POST /api/auth/login
// @access  Public
router.post("/login", login);

// @desc    Получение и обновление профиля пользователя
// @route   GET /api/auth/profile
// @route   PUT /api/auth/profile
// @route   DELETE /api/auth/profile
// @access  Private
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteUserProfile);

export default router;
