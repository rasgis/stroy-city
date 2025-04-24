import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

/**
 * Middleware для проверки аутентификации пользователя
 * Проверяет JWT токен и добавляет пользователя в req.user
 *
 * @desc    Защита маршрутов, требующих авторизации
 * @access  Private
 */
const protect = asyncHandler(async (req, res, next) => {
  // Проверка наличия заголовка авторизации
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer ")
  ) {
    res.status(401);
    throw new Error("Требуется авторизация");
  }

  // Извлечение токена
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    res.status(401);
    throw new Error("Токен не предоставлен");
  }

  try {
    // Верификация токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Определение ID пользователя из токена
    let userId;
    if (decoded.user && decoded.user.id) {
      userId = decoded.user.id;
    } else if (decoded.id) {
      userId = decoded.id;
    } else {
      res.status(401);
      throw new Error("Недействительный токен");
    }

    // Поиск пользователя в базе данных
    const user = await User.findById(userId).select("-password");
    if (!user) {
      res.status(401);
      throw new Error("Пользователь не найден");
    }

    // Проверка валидности роли пользователя (дополнительная защита)
    if (user.role !== "user" && user.role !== "admin") {
      console.error(
        "[Auth Middleware] ВНИМАНИЕ: Обнаружена недопустимая роль пользователя:",
        user.role
      );

      // В случае обнаружения недопустимой роли, устанавливаем роль по умолчанию
      user.role = "user";

      // Сохраняем обновленную роль
      await User.findByIdAndUpdate(userId, { role: "user" });
    }

    // Установка пользователя в объект запроса
    req.user = user;

    next();
  } catch (error) {
    res.status(401);
    throw new Error("Недействительный токен");
  }
});

/**
 * Middleware для проверки прав администратора
 * Требует предварительного использования middleware protect
 *
 * @desc    Защита маршрутов, требующих права администратора
 * @access  Private/Admin
 */
const admin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Требуется авторизация");
  }

  // Дополнительная проверка роли из базы данных для предотвращения подделки
  const freshUserData = await User.findById(req.user._id).select("role");
  if (!freshUserData) {
    res.status(401);
    throw new Error("Пользователь не найден");
  }

  const userRole = freshUserData.role;

  if (userRole !== "admin") {
    console.error(
      "[Auth Middleware] ВНИМАНИЕ: Попытка доступа к административным функциям пользователем без прав:",
      {
        userId: req.user._id,
        userRole: userRole,
        path: req.originalUrl,
        method: req.method,
      }
    );
    res.status(403);
    throw new Error("Доступ запрещен. Требуются права администратора");
  }

  next();
});

export { protect, admin };
