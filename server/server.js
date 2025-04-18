import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import { authRoutes } from "./routes/auth.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import userRoutes from "./routes/userRoutes.js";
// import emailRoutes from "./routes/emailRoutes.js";
import fs from "fs";
import { dirname } from "path";

// Получаем текущую директорию
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Проверяем и создаем директорию uploads если она не существует
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Загружаем переменные окружения из корня проекта
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Проверяем загрузку переменных окружения
console.log("Environment variables:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
console.log("MONGO_URI:", process.env.MONGO_URI);

const app = express();

// Подключение к базе данных
connectDB();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));

// Настройка статических файлов
const publicDir = path.join(__dirname, "..", "public");
app.use("/public", express.static(publicDir));
app.use("/uploads", express.static(uploadsDir));
app.use(
  "/uploads/categories",
  express.static(path.join(__dirname, "uploads", "categories"))
);
app.use(
  "/uploads/products",
  express.static(path.join(__dirname, "uploads", "products"))
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/upload", uploadRoutes);
// app.use("/api/email", emailRoutes);

// Базовый роут для проверки
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "API работает корректно!" });
});

// Для обработки путей в production (Vercel)
if (process.env.NODE_ENV === "production") {
  // Путь к статическим файлам сборки
  const distPath = path.join(__dirname, "..", "dist");
  app.use(express.static(distPath));

  // Любые запросы не к API перенаправляем на React приложение
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api/")) {
      res.sendFile(path.join(distPath, "index.html"));
    }
  });
}

const PORT = process.env.PORT || 3001;

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});

// Для Vercel экспортируем приложение
export default app;
