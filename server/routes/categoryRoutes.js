import express from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
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

export default router;
