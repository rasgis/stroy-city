import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  permanentDeleteProduct,
  restoreProduct,
  getAllProductsAdmin,
  getProductsByCategory,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getProducts); // получение всех продуктов
router.get("/category/:categoryId", getProductsByCategory); // получение продуктов по категории

router.get("/admin/all", protect, admin, getAllProductsAdmin); // получение всех продуктов для администратора

router.get("/:id", getProductById); // получение индивидуального продукта по ID
  
router.post("/", protect, admin, createProduct); // создание нового продукта
router.put("/:id", protect, admin, updateProduct); // обновление продукта
router.delete("/:id", protect, admin, deleteProduct); // удаление продукта
router.delete("/permanent/:id", protect, admin, permanentDeleteProduct); // удаление продукта на постоянной основе
router.put("/restore/:id", protect, admin, restoreProduct); // восстановление продукта

export default router;
