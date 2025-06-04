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

router.use(logRequests);

router.route("/").get(getCategories).post(protect, admin, createCategory);

router
  .route("/:id")
  .get(getCategoryById)
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

router.route("/:id/hide").put(protect, admin, hideCategory);

router.route("/:id/restore").put(protect, admin, restoreCategory);

export default router;
