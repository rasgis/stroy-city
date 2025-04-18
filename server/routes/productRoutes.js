import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/products - получение всех товаров
// POST /api/products - создание товара (только админ)
router.route("/").get(getProducts).post(protect, admin, createProduct);

// GET /api/products/:id - получение товара по ID
// PUT /api/products/:id - обновление товара (только админ)
// DELETE /api/products/:id - удаление товара (только админ)
router
  .route("/:id")
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

export default router;
