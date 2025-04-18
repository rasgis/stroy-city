import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import generateFileName from "../utils/generateFileName.js";

// Получаем путь к текущей директории
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Создаем директории для загрузок, если они не существуют
const categoriesDir = path.join(
  __dirname,
  "..",
  "..",
  "server",
  "uploads",
  "categories"
);
const productsDir = path.join(
  __dirname,
  "..",
  "..",
  "server",
  "uploads",
  "products"
);

[categoriesDir, productsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Настройка хранилища для загрузки файлов
export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Определяем тип загрузки из URL или параметров запроса
    const isCategoryUpload = req.originalUrl.includes("/categories");
    const uploadDir = isCategoryUpload ? categoriesDir : productsDir;
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Используем нашу утилиту для генерации имени файла
    const newFileName = generateFileName(file.originalname);
    cb(null, newFileName);
  },
});

// Фильтр файлов
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Не поддерживаемый формат файла."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export default upload;
