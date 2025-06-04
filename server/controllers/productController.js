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

export const getProductsByCategory = asyncHandler(async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
      return sendNotFound(res, "Категория не найдена");
    }

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

export const getProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");

    if (!product) {
      return sendNotFound(res, "Продукт не найден");
    }

    if (!product.isActive && (!req.user || req.user.role !== "admin")) {
      return sendNotFound(res, "Продукт не найден или недоступен");
    }

    sendSuccess(res, product);
  } catch (error) {
    handleControllerError(res, "получении", error, "продукта");
  }
});

export const createProduct = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      unitOfMeasure,
      stock,
    } = req.body;

    if (!name || !description || !price || !category || !image) {
      return sendBadRequest(
        res,
        "Название, описание, цена, категория и изображение обязательны для заполнения"
      );
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return sendBadRequest(res, "Указанная категория не существует");
    }

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
      category,
      image,
      unitOfMeasure: unitOfMeasure || "шт.",
      stock: stock || 0,
      isActive: true,
    });

    const createdProduct = await product.save();
    sendCreated(res, createdProduct);
  } catch (error) {
    handleControllerError(res, "создании", error, "продукта");
  }
});

export const updateProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendNotFound(res, "Продукт не найден");
    }

    const { category } = req.body;

    if (category && category !== product.category.toString()) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return sendBadRequest(res, "Указанная категория не существует");
      }
    }

    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price ?? product.price;
    product.category = category || product.category;
    product.image = req.body.image || product.image;
    product.unitOfMeasure = req.body.unitOfMeasure || product.unitOfMeasure;
    product.stock = req.body.stock ?? product.stock;

    if (req.body.isActive !== undefined) {
      product.isActive = req.body.isActive;
    }

    const updatedProduct = await product.save();
    sendSuccess(res, updatedProduct);
  } catch (error) {
    handleControllerError(res, "обновлении", error, "продукта");
  }
});

export const deleteProduct = asyncHandler(async (req, res) => { // скрытие продукта
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

export const restoreProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendNotFound(res, "Продукт не найден");
    }

    product.isActive = true;
    const updatedProduct = await product.save();

    const fullProduct = await Product.findById(updatedProduct._id).populate(
      "category"
    );

    res.status(200).json(fullProduct);
  } catch (error) {
    handleControllerError(res, "восстановлении", error, "продукта");
  }
});

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
