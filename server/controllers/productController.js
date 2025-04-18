import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Product from "../models/productModel.js";

// @desc    Получение всех товаров
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).populate("category", "name");

  console.log(`Найдено ${products.length} товаров`);
  // Выведем пример первого продукта для дебага
  if (products.length > 0) {
    console.log("Первый товар:", products[0]);
  }

  res.json(products);
});

// @desc    Получение одного товара по ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "category",
    "name"
  );

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Товар не найден");
  }
});

// @desc    Создание товара
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, unitOfMeasure, stock, isActive } =
    req.body;

  // Получаем путь к загруженному файлу из multer
  const image = req.file
    ? `/uploads/products/${req.file.filename}`
    : req.body.image;

  // Если категория приходит строкой, преобразуем в ObjectId
  let categoryId = category;
  if (category && typeof category === "string") {
    categoryId = new mongoose.Types.ObjectId(category);
  }

  const product = await Product.create({
    name,
    description,
    price,
    image,
    category: categoryId,
    unitOfMeasure,
    stock,
    isActive,
  });

  if (product) {
    // Получаем полный продукт с заполненной категорией
    const populatedProduct = await Product.findById(product._id).populate(
      "category",
      "name"
    );
    res.status(201).json(populatedProduct);
  } else {
    res.status(400);
    throw new Error("Невалидные данные товара");
  }
});

// @desc    Обновление товара
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  // Получаем путь к загруженному файлу из multer
  const image = req.file
    ? `/uploads/products/${req.file.filename}`
    : req.body.image;

  // Если категория приходит строкой, преобразуем в ObjectId
  if (req.body.category && typeof req.body.category === "string") {
    req.body.category = new mongoose.Types.ObjectId(req.body.category);
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      image: image,
      category: req.body.category,
      unitOfMeasure: req.body.unitOfMeasure,
      stock: req.body.stock,
      isActive: req.body.isActive,
    },
    { new: true, runValidators: true }
  ).populate("category", "name");

  if (updatedProduct) {
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Товар не найден");
  }
});

// @desc    Удаление товара
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();
    res.json({ message: "Товар удален" });
  } else {
    res.status(404);
    throw new Error("Товар не найден");
  }
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
