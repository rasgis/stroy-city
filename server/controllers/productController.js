import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";

/**
 * @desc    Получение всех активных продуктов
 * @route   GET /api/products
 * @access  Публичный
 * @returns {Array} Массив активных продуктов
 */
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate("category", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: `Ошибка при получении продуктов: ${error.message}`,
    });
  }
};

/**
 * @desc    Получение продукта по ID
 * @route   GET /api/products/:id
 * @access  Публичный
 * @param   {string} req.params.id - ID продукта
 * @returns {Object} Данные продукта
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name"
    );
    if (!product) {
      return res.status(404).json({ message: "Продукт не найден" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: `Ошибка при получении продукта: ${error.message}`,
    });
  }
};

/**
 * @desc    Создание нового продукта
 * @route   POST /api/products
 * @access  Приватный/Админ
 * @param   {Object} req.body - Данные продукта
 * @returns {Object} Данные созданного продукта
 */
export const createProduct = async (req, res) => {
  try {
    // Проверяем права доступа
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Доступ запрещен. Требуются права администратора." });
    }

    // Проверяем существование категории
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      return res
        .status(400)
        .json({ message: "Указанная категория не найдена" });
    }

    const newProduct = await Product.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({
      message: `Ошибка при создании продукта: ${error.message}`,
    });
  }
};

/**
 * @desc    Обновление существующего продукта
 * @route   PUT /api/products/:id
 * @access  Приватный/Админ
 * @param   {string} req.params.id - ID продукта
 * @param   {Object} req.body - Данные для обновления
 * @returns {Object} Обновленные данные продукта
 */
export const updateProduct = async (req, res) => {
  try {
    // Проверяем права доступа
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Доступ запрещен. Требуются права администратора." });
    }

    // Проверяем существование продукта
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Продукт не найден" });
    }

    // Если категория меняется, проверяем её существование
    if (
      req.body.category &&
      req.body.category !== product.category.toString()
    ) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return res
          .status(400)
          .json({ message: "Указанная категория не найдена" });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("category", "name");

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({
      message: `Ошибка при обновлении продукта: ${error.message}`,
    });
  }
};

/**
 * @desc    Удаление продукта (soft delete - установка isActive: false)
 * @route   DELETE /api/products/:id
 * @access  Приватный/Админ
 * @param   {string} req.params.id - ID продукта
 * @returns {Object} Сообщение об успешном удалении
 */
export const deleteProduct = async (req, res) => {
  try {
    // Проверяем права доступа
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Доступ запрещен. Требуются права администратора." });
    }

    // Проверяем существование продукта
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Продукт не найден" });
    }

    // Soft delete - устанавливаем isActive в false вместо физического удаления
    product.isActive = false;
    await product.save();

    res.status(200).json({ message: "Продукт успешно удален" });
  } catch (error) {
    res.status(500).json({
      message: `Ошибка при удалении продукта: ${error.message}`,
    });
  }
};

/**
 * @desc    Получение всех продуктов (включая неактивные) для админ-панели
 * @route   GET /api/products/admin/all
 * @access  Приватный/Админ
 * @returns {Array} Массив всех продуктов
 */
export const getAllProductsAdmin = async (req, res) => {
  try {
    // Проверяем права доступа
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Доступ запрещен. Требуются права администратора." });
    }

    const products = await Product.find({})
      .populate("category", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: `Ошибка при получении продуктов: ${error.message}`,
    });
  }
};

/**
 * @desc    Получение продуктов по категории
 * @route   GET /api/products/category/:categoryId
 * @access  Публичный
 * @param   {string} req.params.categoryId - ID категории
 * @returns {Array} Массив продуктов указанной категории
 */
export const getProductsByCategory = async (req, res) => {
  try {
    // Проверяем существование категории
    const categoryExists = await Category.findById(req.params.categoryId);
    if (!categoryExists) {
      return res.status(404).json({ message: "Категория не найдена" });
    }

    const products = await Product.find({
      category: req.params.categoryId,
      isActive: true,
    }).populate("category", "name");

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: `Ошибка при получении продуктов по категории: ${error.message}`,
    });
  }
};
