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

const logRequests = (req, res, next) => {
  console.log(`[Category Routes] ${req.method} ${req.originalUrl}`);
  next(); 
};

router.use(logRequests); // логирование запросов

router.route("/").get(getCategories).post(protect, admin, createCategory); // получение всех категорий и создание новой категории

router
  .route("/:id") // получение, обновление и удаление категории по ID
  .get(getCategoryById) // получение категории по ID
  .put(protect, admin, updateCategory) // обновление категории
  .delete(protect, admin, deleteCategory); // удаление категории

router.route("/:id/hide").put(protect, admin, hideCategory); // скрытие категории

router.route("/:id/restore").put(protect, admin, restoreCategory); // восстановление категории

export default router;
