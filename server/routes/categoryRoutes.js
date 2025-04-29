import express from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  hideCategory,
  restoreCategory,
} from "../controllers/categoryController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Добавляем middleware для логирования запросов
const logRequests = (req, res, next) => {
  console.log(`[Category Routes] ${req.method} ${req.originalUrl}`);
  next();
};

// Применяем middleware логирования ко всем маршрутам
router.use(logRequests);

// @desc    Получение всех категорий и создание новой категории
// @route   GET /api/categories
// @route   POST /api/categories
// @access  Public (GET), Private/Admin (POST)
router.route("/").get(getCategories).post(protect, admin, createCategory);

// @desc    Получение, обновление и удаление категории по ID
// @route   GET /api/categories/:id
// @route   PUT /api/categories/:id
// @route   DELETE /api/categories/:id
// @access  Public (GET), Private/Admin (PUT, DELETE)
router
  .route("/:id")
  .get(getCategoryById)
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

// @desc    Скрытие категории (soft delete)
// @route   PUT /api/categories/:id/hide
// @access  Private/Admin
router.route("/:id/hide").put(protect, admin, hideCategory);

// @desc    Восстановление скрытой категории
// @route   PUT /api/categories/:id/restore
// @access  Private/Admin
router.route("/:id/restore").put(protect, admin, restoreCategory);

export default router;
