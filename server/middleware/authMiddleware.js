import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

// Проверка JWT токена и установка пользователя в req.user
const protect = async (req, res, next) => {
  try {
    console.log("Аутентификация запроса");
    
    // Проверка наличия заголовка авторизации
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
      console.log("Ошибка: Заголовок авторизации отсутствует или имеет неверный формат");
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    
    // Извлечение токена
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      console.log("Ошибка: Токен отсутствует");
      return res.status(401).json({ message: "Токен не предоставлен" });
    }
    
    try {
      // Верификация токена
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Токен верифицирован:", decoded);
      
      // Определение ID пользователя из токена
      let userId;
      if (decoded.user && decoded.user.id) {
        userId = decoded.user.id;
      } else if (decoded.id) {
        userId = decoded.id;
      } else {
        console.log("Ошибка: Невозможно извлечь ID пользователя из токена");
        return res.status(401).json({ message: "Недействительный токен" });
      }
      
      // Поиск пользователя в базе данных
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        console.log("Ошибка: Пользователь не найден в базе данных");
        return res.status(401).json({ message: "Пользователь не найден" });
      }
      
      // Установка пользователя в объект запроса
      req.user = user;
      console.log("Пользователь аутентифицирован:", user._id);
      
      // Переход к следующему middleware
      next();
    } catch (jwtError) {
      console.log("Ошибка верификации токена:", jwtError.message);
      return res.status(401).json({ message: "Недействительный токен" });
    }
  } catch (error) {
    console.error("Критическая ошибка в middleware аутентификации:", error);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Middleware для проверки прав администратора
const admin = async (req, res, next) => {
  try {
    console.log("Проверка прав администратора");
    
    if (!req.user) {
      console.log("Ошибка: Пользователь не аутентифицирован");
      return res.status(401).json({ message: "Требуется авторизация" });
    }
    
    if (req.user.role !== "admin") {
      console.log("Ошибка: Недостаточно прав, пользователь не является администратором:", req.user.role);
      return res.status(403).json({ message: "Доступ запрещен. Требуются права администратора" });
    }
    
    console.log("Доступ разрешен. Пользователь имеет права администратора.");
    next();
  } catch (error) {
    console.error("Ошибка в middleware проверки прав:", error);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

export { protect, admin };
