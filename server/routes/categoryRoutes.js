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

// GET /api/categories - получение всех категорий
// POST /api/categories - создание категории (только админ)
router.route("/").get(getCategories).post(protect, admin, createCategory);

// GET /api/categories/:id - получение категории по ID
// PUT /api/categories/:id - обновление категории (только админ)
// DELETE /api/categories/:id - удаление категории (только админ)
router
  .route("/:id")
  .get(getCategoryById)
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

export default router;
