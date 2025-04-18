import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import { protect } from "../middleware/authMiddleware.js";
import generateFileName from "../utils/generateFileName.js";

const router = express.Router();

// Получаем путь к текущей директории
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Создаем директорию для загрузок, если она не существует
const uploadsDir = path.join(__dirname, "..", "..", "server", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Настройка хранилища для multer
const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Определение типа загрузки на основе referer или query параметра
    const referer = req.get("referer") || "";

    if (
      referer.includes("/admin/categories") ||
      req.query.type === "category"
    ) {
      const categoryDir = path.join(uploadsDir, "categories");
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }
      cb(null, categoryDir);
    } else if (
      referer.includes("/admin/products") ||
      req.query.type === "product"
    ) {
      const productDir = path.join(uploadsDir, "products");
      if (!fs.existsSync(productDir)) {
        fs.mkdirSync(productDir, { recursive: true });
      }
      cb(null, productDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename(req, file, cb) {
    // Используем нашу утилиту для генерации имени файла
    const newFileName = generateFileName(file.originalname);
    cb(null, newFileName);
  },
});

// Фильтр файлов - разрешаем только изображения
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Разрешены только изображения!"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5000000 }, // 5MB
});

// POST /api/upload - загрузка одного файла
router.post("/", protect, upload.single("file"), (req, res) => {
  // Определяем папку на основе referer или query параметра
  const referer = req.get("referer") || "";
  let filePath;

  if (referer.includes("/admin/categories") || req.query.type === "category") {
    filePath = "/uploads/categories/" + req.file.filename;
  } else if (
    referer.includes("/admin/products") ||
    req.query.type === "product"
  ) {
    filePath = "/uploads/products/" + req.file.filename;
  } else {
    filePath = "/uploads/" + req.file.filename;
  }

  res.json({ filePath });
});

export default router;
