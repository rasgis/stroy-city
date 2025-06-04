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

router.get("/", getProducts);
router.get("/category/:categoryId", getProductsByCategory); 

router.get("/admin/all", protect, admin, getAllProductsAdmin); 

router.get("/:id", getProductById);
  
router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);
router.delete("/permanent/:id", protect, admin, permanentDeleteProduct);
router.put("/restore/:id", protect, admin, restoreProduct);

export default router;
