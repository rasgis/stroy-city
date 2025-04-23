import express from "express";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Добавляем middleware для логирования запросов
const logRequests = (req, res, next) => {
  console.log(`[User Routes] ${req.method} ${req.originalUrl}`);
  next();
};

// Применяем middleware логирования ко всем маршрутам
router.use(logRequests);

// @desc    Получение всех пользователей
// @route   GET /api/users
// @access  Private/Admin
router.route("/").get(protect, admin, getUsers);

// @desc    Получение, обновление и удаление пользователя по ID
// @route   GET /api/users/:id
// @route   PUT /api/users/:id
// @route   DELETE /api/users/:id
// @access  Private/Admin
router
  .route("/:id")
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

export default router;
