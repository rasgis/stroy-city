import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import { requireAdmin } from "../utils/controllerUtils/index.js";

// Проверяем JWT токен и добавляем пользователя в req.user
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const userId = decoded.user ? decoded.user.id : null;

      if (!userId) {
        throw new Error("Некорректная структура токена");
      }

      req.user = await User.findById(userId).select("-password");

      if (!req.user) {
        throw new Error("Пользователь не найден");
      }

      next();
    } catch (error) {
      console.error("Ошибка аутентификации:", error);
      res.status(401);
      throw new Error("Не авторизован, токен недействителен");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Не авторизован, токен отсутствует");
  }
});

const admin = (req, res, next) => {
  requireAdmin(req, res, next);
};

export { protect, admin };
