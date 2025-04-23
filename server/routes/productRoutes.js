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

// Добавляем middleware для логирования запросов
const logRequests = (req, res, next) => {
  console.log(`[Product Routes] ${req.method} ${req.originalUrl}`);
  next();
};

// Применяем middleware логирования ко всем маршрутам
router.use(logRequests);

// @desc    Получение всех товаров и создание нового товара
// @route   GET /api/products
// @route   POST /api/products
// @access  Public (GET), Private/Admin (POST)
router.route("/").get(getProducts).post(protect, admin, createProduct);

// @desc    Получение, обновление и удаление товара по ID
// @route   GET /api/products/:id
// @route   PUT /api/products/:id
// @route   DELETE /api/products/:id
// @access  Public (GET), Private/Admin (PUT, DELETE)
router
  .route("/:id")
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

export default router;
