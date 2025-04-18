import asyncHandler from "express-async-handler";
import Category from "../models/categoryModel.js";
import mongoose from "mongoose";

// @desc    Получение всех категорий
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  res.json(categories);
});

// @desc    Получение категории по ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    res.json(category);
  } else {
    res.status(404);
    throw new Error("Категория не найдена");
  }
});

// @desc    Создание категории
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  try {
    const { name, parentId, image, description } = req.body;

    if (!name) {
      res.status(400);
      throw new Error("Название категории обязательно");
    }

    if (!image) {
      res.status(400);
      throw new Error("Изображение категории обязательно");
    }

    const categoryExists = await Category.findOne({ name });

    if (categoryExists) {
      res.status(400);
      throw new Error("Категория с таким названием уже существует");
    }

    // Преобразуем parentId в ObjectId, если он не пустой
    const parentIdObj =
      parentId && parentId !== ""
        ? new mongoose.Types.ObjectId(parentId)
        : null;

    const category = await Category.create({
      name,
      image,
      description,
      parentId: parentIdObj,
    });

    if (category) {
      res.status(201).json(category);
    } else {
      res.status(400);
      throw new Error("Невалидные данные категории");
    }
  } catch (error) {
    console.error("Error in createCategory:", error);
    throw error;
  }
});

// @desc    Обновление категории
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  try {
    const { name, parentId, image, description } = req.body;

    const category = await Category.findById(req.params.id);

    if (category) {
      if (name && name !== category.name) {
        const categoryExists = await Category.findOne({ name });
        if (categoryExists) {
          res.status(400);
          throw new Error("Категория с таким названием уже существует");
        }
        category.name = name;
      }

      category.parentId = parentId || category.parentId;
      category.image = image || category.image;
      category.description = description || category.description;

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404);
      throw new Error("Категория не найдена");
    }
  } catch (error) {
    console.error("Error in updateCategory:", error);
    throw error;
  }
});

// @desc    Удаление категории
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      await category.deleteOne();
      res.json({ message: "Категория удалена" });
    } else {
      res.status(404);
      throw new Error("Категория не найдена");
    }
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    throw error;
  }
});

export {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
