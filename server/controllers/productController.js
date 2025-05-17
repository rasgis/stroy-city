import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import {
  sendSuccess,
  sendCreated,
  sendNotFound,
  sendBadRequest,
  checkUniqueness,
  handleControllerError,
} from "../utils/controllerUtils/index.js";
import asyncHandler from "express-async-handler";

// Получение всех продуктов (активных, для покупателей)
export const getProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate("category")
      .sort({ createdAt: -1 });
    sendSuccess(res, products);
  } catch (error) {
    handleControllerError(res, "получении списка", error, "продуктов");
  }
});

// Получение продуктов по категории
export const getProductsByCategory = asyncHandler(async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Проверяем, существует ли категория
    const category = await Category.findById(categoryId);
    if (!category) {
      return sendNotFound(res, "Категория не найдена");
    }

    // Находим продукты в этой категории
    const products = await Product.find({
      category: categoryId,
      isActive: true,
    }).populate("category");

    sendSuccess(res, products);
  } catch (error) {
    handleControllerError(
      res,
      "получении продуктов по категории",
      error,
      "продуктов"
    );
  }
});

// Получение всех продуктов для админ панели (включая неактивные)
export const getAllProductsAdmin = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("category")
      .sort({ createdAt: -1 });
    sendSuccess(res, products);
  } catch (error) {
    handleControllerError(res, "получении всех продуктов", error, "продуктов");
  }
});

// Получение продукта по ID
export const getProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");

    if (!product) {
      return sendNotFound(res, "Продукт не найден");
    }

    // Если продукт не активен и запрос не от админа, возвращаем 404
    if (!product.isActive && (!req.user || req.user.role !== "admin")) {
      return sendNotFound(res, "Продукт не найден или недоступен");
    }

    sendSuccess(res, product);
  } catch (error) {
    handleControllerError(res, "получении", error, "продукта");
  }
});

// Создание нового продукта (только для админов)
export const createProduct = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category, // используем category как передано с фронтенда
      image,
      unitOfMeasure,
      stock,
    } = req.body;

    // Базовая валидация обязательных полей согласно модели
    if (!name || !description || !price || !category || !image) {
      return sendBadRequest(
        res,
        "Название, описание, цена, категория и изображение обязательны для заполнения"
      );
    }

    // Проверка существования категории
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return sendBadRequest(res, "Указанная категория не существует");
    }

    // Проверка уникальности имени
    const isNameUnique = await checkUniqueness(
      Product,
      { name },
      res,
      "Продукт с таким именем уже существует"
    );

    if (!isNameUnique) return;

    const product = new Product({
      name,
      description,
      price,
      category, // сохраняем category как есть
      image,
      unitOfMeasure: unitOfMeasure || "шт.",
      stock: stock || 0, // используем переданное значение или 0 по умолчанию
      isActive: true,
    });

    const createdProduct = await product.save();
    sendCreated(res, createdProduct);
  } catch (error) {
    handleControllerError(res, "создании", error, "продукта");
  }
});

// Обновление продукта (только для админов)
export const updateProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendNotFound(res, "Продукт не найден");
    }

    const { category } = req.body;

    // Проверка существования категории, если она изменена
    if (category && category !== product.category.toString()) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return sendBadRequest(res, "Указанная категория не существует");
      }
    }

    // Обновление полей
    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price ?? product.price; // используем ?? для числовых полей
    product.category = category || product.category;
    product.image = req.body.image || product.image;
    product.unitOfMeasure = req.body.unitOfMeasure || product.unitOfMeasure;
    product.stock = req.body.stock ?? product.stock; // используем ?? для числовых полей

    // Если в запросе явно указано изменение активности
    if (req.body.isActive !== undefined) {
      product.isActive = req.body.isActive;
    }

    const updatedProduct = await product.save();
    sendSuccess(res, updatedProduct);
  } catch (error) {
    handleControllerError(res, "обновлении", error, "продукта");
  }
});

// Скрытие продукта (только для админов)
export const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendNotFound(res, "Продукт не найден");
    }

    product.isActive = false;
    await product.save();

    sendSuccess(res, { message: "Продукт успешно скрыт" });
  } catch (error) {
    handleControllerError(res, "скрытии", error, "продукта");
  }
});

// Восстановление продукта (только для админов)
export const restoreProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendNotFound(res, "Продукт не найден");
    }

    product.isActive = true;
    const updatedProduct = await product.save();

    // Получаем полные данные продукта с заполненными полями
    const fullProduct = await Product.findById(updatedProduct._id).populate(
      "category"
    );

    // Отправляем полные данные продукта в ответе
    res.status(200).json(fullProduct);
  } catch (error) {
    handleControllerError(res, "восстановлении", error, "продукта");
  }
});

// Полное удаление продукта (только для админов)
export const permanentDeleteProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendNotFound(res, "Продукт не найден");
    }

    await product.deleteOne();
    sendSuccess(res, { message: "Продукт полностью удален" });
  } catch (error) {
    handleControllerError(res, "полном удалении", error, "продукта");
  }
});
