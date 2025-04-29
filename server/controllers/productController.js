import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import {
  sendSuccess,
  sendCreated,
  sendMessage,
  sendError,
  sendNotFound,
  sendBadRequest,
  checkEntityExistsOrFail,
  checkUniqueness,
} from "../utils/controllerUtils/index.js";
import asyncHandler from "express-async-handler";

// Базовая обработка ошибок для контроллеров
const handleControllerError = (res, operation, error) => {
  console.error(`Ошибка при ${operation} продукта:`, error);
  sendError(res, `Ошибка при ${operation} продукта: ${error.message}`);
};

// Получение всех активных продуктов для клиентов
export const getProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    sendSuccess(res, products);
  } catch (error) {
    handleControllerError(res, "получении", error);
  }
});

// Получение продукта по ID
export const getProductById = asyncHandler(async (req, res) => {
  try {
    const product = await checkEntityExistsOrFail(
      res,
      Product,
      req.params.id,
      { populate: { path: "category", select: "name" } },
      "Продукт"
    );

    if (!product) return;

    sendSuccess(res, product);
  } catch (error) {
    handleControllerError(res, "получении", error);
  }
});

// Создание нового продукта (только для админов)
export const createProduct = asyncHandler(async (req, res) => {
  try {
    // Проверка прав доступа
    if (!req.user || req.user.role !== "admin") {
      return sendError(
        res,
        "Доступ запрещен. Требуются права администратора.",
        403
      );
    }

    // Проверка существования категории
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      return sendBadRequest(res, "Указанная категория не найдена");
    }

    const newProduct = await Product.create(req.body);
    sendCreated(res, newProduct);
  } catch (error) {
    handleControllerError(res, "создании", error);
  }
});

// Обновление продукта (только для админов)
export const updateProduct = asyncHandler(async (req, res) => {
  try {
    // Проверка прав доступа
    if (!req.user || req.user.role !== "admin") {
      return sendError(
        res,
        "Доступ запрещен. Требуются права администратора.",
        403
      );
    }

    const product = await checkEntityExistsOrFail(
      res,
      Product,
      req.params.id,
      {},
      "Продукт"
    );

    if (!product) return;

    // Проверка существования категории при изменении
    if (
      req.body.category &&
      req.body.category !== product.category.toString()
    ) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return sendBadRequest(res, "Указанная категория не найдена");
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("category", "name");

    sendSuccess(res, updatedProduct);
  } catch (error) {
    handleControllerError(res, "обновлении", error);
  }
});

// Скрытие продукта (soft delete)
export const deleteProduct = asyncHandler(async (req, res) => {
  try {
    // Проверка прав доступа
    if (!req.user || req.user.role !== "admin") {
      return sendError(
        res,
        "Доступ запрещен. Требуются права администратора.",
        403
      );
    }

    const product = await checkEntityExistsOrFail(
      res,
      Product,
      req.params.id,
      {},
      "Продукт"
    );

    if (!product) return;

    product.isActive = false;
    await product.save();

    sendMessage(res, "Продукт успешно скрыт");
  } catch (error) {
    handleControllerError(res, "скрытии", error);
  }
});

// Полное удаление продукта из базы данных
export const permanentDeleteProduct = asyncHandler(async (req, res) => {
  try {
    // Проверка прав доступа
    if (!req.user || req.user.role !== "admin") {
      return sendError(
        res,
        "Доступ запрещен. Требуются права администратора.",
        403
      );
    }

    const product = await checkEntityExistsOrFail(
      res,
      Product,
      req.params.id,
      {},
      "Продукт"
    );

    if (!product) return;

    await Product.findByIdAndDelete(req.params.id);

    sendMessage(res, "Продукт успешно удален из базы данных");
  } catch (error) {
    handleControllerError(res, "удалении", error);
  }
});

// Восстановление скрытого продукта
export const restoreProduct = asyncHandler(async (req, res) => {
  try {
    // Проверка прав доступа
    if (!req.user || req.user.role !== "admin") {
      return sendError(
        res,
        "Доступ запрещен. Требуются права администратора.",
        403
      );
    }

    const product = await checkEntityExistsOrFail(
      res,
      Product,
      req.params.id,
      {},
      "Продукт"
    );

    if (!product) return;

    product.isActive = true;
    const restoredProduct = await product.save();

    sendSuccess(res, restoredProduct);
  } catch (error) {
    handleControllerError(res, "восстановлении", error);
  }
});

// Получение всех продуктов для админ-панели
export const getAllProductsAdmin = asyncHandler(async (req, res) => {
  try {
    // Проверка прав доступа
    if (!req.user || req.user.role !== "admin") {
      return sendError(
        res,
        "Доступ запрещен. Требуются права администратора.",
        403
      );
    }

    const products = await Product.find({})
      .populate("category", "name")
      .sort({ createdAt: -1 });

    sendSuccess(res, products);
  } catch (error) {
    handleControllerError(res, "получении", error);
  }
});

// Получение продуктов по категории
export const getProductsByCategory = asyncHandler(async (req, res) => {
  try {
    const categoryExists = await Category.findById(req.params.categoryId);
    if (!categoryExists) {
      return sendNotFound(res, "Категория не найдена");
    }

    const products = await Product.find({
      category: req.params.categoryId,
      isActive: true,
    }).populate("category", "name");

    sendSuccess(res, products);
  } catch (error) {
    handleControllerError(res, "получении продуктов по категории", error);
  }
});
