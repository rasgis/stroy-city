import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import User from "./models/userModel.js";
import Category from "./models/categoryModel.js";
import Product from "./models/productModel.js";

// Инициализация переменных окружения
dotenv.config();

// Подключение к базе данных
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Чтение тестовых данных из JSON файла
const readJsonFile = (filename) => {
  const filePath = path.join(__dirname, "..", "src", "db.json");
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Ошибка чтения файла ${filename}:`, error);
    return null;
  }
};

// Импорт данных в базу данных
const importData = async () => {
  try {
    // Очистка базы данных
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();

    console.log("База данных очищена");

    // Чтение данных из файла
    const jsonData = readJsonFile("db.json");

    if (!jsonData) {
      console.error("Не удалось прочитать данные из файла");
      process.exit(1);
    }

    // Создание администратора
    const adminUser = await User.create({
      name: "Администратор",
      email: "admin@example.com",
      login: "admin",
      password: "admin123",
      role: "admin",
    });

    console.log("Создан администратор:", adminUser.email);

    // Импорт категорий
    const categories = await Promise.all(
      jsonData.categories.map(async (category) => {
        const newCategory = await Category.create({
          name: category.name,
          description: category.description,
          image: category.image,
        });
        return newCategory;
      })
    );

    console.log(`Импортировано ${categories.length} категорий`);

    // Импорт товаров
    const categoryMap = categories.reduce((map, category) => {
      map[category.name.toLowerCase()] = category._id;
      return map;
    }, {});

    // Функция для поиска ID категории
    const findCategoryId = (categoryName) => {
      // Сопоставляем категории по имени
      const lowerCaseName = categoryName.toLowerCase();
      for (const [name, id] of Object.entries(categoryMap)) {
        if (name.includes(lowerCaseName) || lowerCaseName.includes(name)) {
          return id;
        }
      }
      // Возвращаем первую категорию, если не нашли совпадения
      return categories[0]._id;
    };

    const products = await Promise.all(
      jsonData.products.map(async (product) => {
        const categoryId =
          typeof product.category === "object"
            ? findCategoryId(product.category.name)
            : categories[0]._id;

        return await Product.create({
          name: product.name,
          description: product.description || "Описание товара отсутствует",
          price: product.price || 0,
          image: product.image || "/placeholder.jpg",
          category: categoryId,
          countInStock: product.countInStock || 10,
          rating: product.rating || 0,
          numReviews: product.numReviews || 0,
        });
      })
    );

    console.log(`Импортировано ${products.length} товаров`);

    console.log("Импорт данных завершен");
    process.exit();
  } catch (error) {
    console.error("Ошибка импорта данных:", error);
    process.exit(1);
  }
};

// Удаление всех данных из базы данных
const destroyData = async () => {
  try {
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();

    console.log("Данные удалены");
    process.exit();
  } catch (error) {
    console.error("Ошибка удаления данных:", error);
    process.exit(1);
  }
};

// Определяем действие по аргументам командной строки
if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
