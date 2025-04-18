import express from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/upload.js";

export const productRoutes = express.Router();

productRoutes.get("/", getProducts);
productRoutes.get("/:id", getProduct);
productRoutes.post("/", auth, upload.single("image"), createProduct);
productRoutes.put("/:id", auth, upload.single("image"), updateProduct);
productRoutes.delete("/:id", auth, deleteProduct);
