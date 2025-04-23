import asyncHandler from "express-async-handler";
import Category from "../models/categoryModel.js";
import mongoose from "mongoose";

/**
 * @desc    Получение всех категорий
 * @route   GET /api/categories
 * @access  Публичный
 * @returns {Array} Массив категорий
 */
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ name: 1 });
  res.status(200).json(categories);
});

/**
 * @desc    Получение категории по ID
 * @route   GET /api/categories/:id
 * @access  Публичный
 * @param   {string} req.params.id - ID категории
 * @returns {Object} Данные категории
 */
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    res.status(200).json(category);
  } else {
    res.status(404).json({ message: "Категория не найдена" });
  }
});

/**
 * @desc    Создание новой категории
 * @route   POST /api/categories
 * @access  Приватный/Админ
 * @param   {Object} req.body - Данные категории
 * @param   {string} req.body.name - Название категории
 * @param   {string} [req.body.parentId] - ID родительской категории (если есть)
 * @param   {string} [req.body.image] - URL изображения категории
 * @param   {string} [req.body.description] - Описание категории
 * @returns {Object} Данные созданной категории
 */
export const createCategory = asyncHandler(async (req, res) => {
  try {
    // Проверяем права доступа
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Доступ запрещен. Требуются права администратора." });
    }

    const { name, parentId, image, description } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ message: "Название категории обязательно" });
    }

    // Проверяем уникальность названия
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({
        message: "Категория с таким названием уже существует",
      });
    }

    // Преобразуем parentId в ObjectId, если он не пустой
    const parentIdObj =
      parentId && parentId !== ""
        ? new mongoose.Types.ObjectId(parentId)
        : null;

    // Если parentId указан, проверяем его существование
    if (parentIdObj) {
      const parentExists = await Category.findById(parentIdObj);
      if (!parentExists) {
        return res.status(400).json({
          message: "Указанная родительская категория не найдена",
        });
      }
    }

    const category = await Category.create({
      name,
      image,
      description,
      parentId: parentIdObj,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({
      message: `Ошибка при создании категории: ${error.message}`,
    });
  }
});

/**
 * @desc    Обновление существующей категории
 * @route   PUT /api/categories/:id
 * @access  Приватный/Админ
 * @param   {string} req.params.id - ID категории
 * @param   {Object} req.body - Данные для обновления
 * @returns {Object} Обновленные данные категории
 */
export const updateCategory = asyncHandler(async (req, res) => {
  try {
    // Проверяем права доступа
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Доступ запрещен. Требуются права администратора." });
    }

    const { name, parentId, image, description } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Категория не найдена" });
    }

    // Проверяем уникальность имени, если оно изменяется
    if (name && name !== category.name) {
      const categoryExists = await Category.findOne({ name });
      if (categoryExists) {
        return res.status(400).json({
          message: "Категория с таким названием уже существует",
        });
      }
    }

    // Если parentId указан и меняется, проверяем его существование
    if (parentId !== undefined && parentId !== category.parentId?.toString()) {
      // Защита от циклической зависимости - категория не может быть родителем сама себе
      if (parentId === req.params.id) {
        return res.status(400).json({
          message: "Категория не может быть родителем сама себе",
        });
      }

      // Проверяем существование родительской категории
      if (parentId && parentId !== "") {
        const parentExists = await Category.findById(parentId);
        if (!parentExists) {
          return res.status(400).json({
            message: "Указанная родительская категория не найдена",
          });
        }
      }
    }

    category.name = name || category.name;
    category.parentId = parentId !== undefined ? parentId : category.parentId;
    category.image = image !== undefined ? image : category.image;
    category.description =
      description !== undefined ? description : category.description;

    const updatedCategory = await category.save();
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({
      message: `Ошибка при обновлении категории: ${error.message}`,
    });
  }
});

/**
 * @desc    Удаление категории
 * @route   DELETE /api/categories/:id
 * @access  Приватный/Админ
 * @param   {string} req.params.id - ID категории
 * @returns {Object} Сообщение об успешном удалении
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  try {
    // Проверяем права доступа
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Доступ запрещен. Требуются права администратора." });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Категория не найдена" });
    }

    // Проверяем, используется ли категория в других записях
    const hasChildren = await Category.exists({ parentId: req.params.id });
    if (hasChildren) {
      return res.status(400).json({
        message:
          "Невозможно удалить категорию, так как она содержит подкатегории",
      });
    }

    await category.deleteOne();
    res.status(200).json({ message: "Категория успешно удалена" });
  } catch (error) {
    res.status(500).json({
      message: `Ошибка при удалении категории: ${error.message}`,
    });
  }
});
