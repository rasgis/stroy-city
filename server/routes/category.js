import express from "express";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import auth from "../middleware/auth.js";

export const categoryRoutes = express.Router();

categoryRoutes.get("/", getCategories);
categoryRoutes.get("/:id", getCategory);
categoryRoutes.post("/", auth, createCategory);
categoryRoutes.put("/:id", auth, updateCategory);
categoryRoutes.delete("/:id", auth, deleteCategory);
