import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

// Проверка JWT токена и установка пользователя в req.user
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Получаем токен из заголовка
      token = req.headers.authorization.split(" ")[1];

      // Верифицируем токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Находим пользователя по id из токена и исключаем пароль из результата
      req.user = await User.findById(decoded.user.id).select("-password");

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Не авторизован, токен не валиден");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Не авторизован, токен отсутствует");
  }
});

// Middleware для проверки прав администратора
const admin = (req, res, next) => {
  console.log("User in admin middleware:", req.user);
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    console.log("Access denied. User role:", req.user?.role);
    res.status(403);
    throw new Error("Нет прав для выполнения этого действия");
  }
};

export { protect, admin };
