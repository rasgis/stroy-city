import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

// Проверка JWT токена и установка пользователя в req.user
const protect = async (req, res, next) => {
  try {
    console.log("Аутентификация запроса");

    // Проверка наличия заголовка авторизации
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer ")
    ) {
      console.log(
        "Ошибка: Заголовок авторизации отсутствует или имеет неверный формат"
      );
      return res.status(401).json({ message: "Требуется авторизация" });
    }

    // Извлечение токена
    const token = req.headers.authorization.split(" ")[1];
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
      const user = await User.findById(userId).select("-password");

      if (!user) {
        console.log("Ошибка: Пользователь не найден в базе данных");
        return res.status(401).json({ message: "Пользователь не найден" });
      }

      // Проверка валидности роли пользователя (дополнительная защита)
      if (user.role !== "user" && user.role !== "admin") {
        console.error(
          "ВНИМАНИЕ: Обнаружена недопустимая роль пользователя:",
          user.role
        );
        console.log("Принудительно устанавливаем роль 'user'");

        // В случае обнаружения недопустимой роли, устанавливаем роль по умолчанию
        user.role = "user";

        // Сохраняем обновленную роль
        await User.findByIdAndUpdate(userId, { role: "user" });
      }

      // Установка пользователя в объект запроса
      req.user = user;
      console.log(
        "Пользователь аутентифицирован:",
        user._id,
        "с ролью:",
        user.role
      );

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

    // Дополнительная проверка роли из базы данных для предотвращения подделки
    const freshUserData = await User.findById(req.user._id).select("role");
    if (!freshUserData) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }

    const userRole = freshUserData.role;

    if (userRole !== "admin") {
      console.log(
        "Ошибка: Недостаточно прав, пользователь не является администратором:",
        userRole
      );

      // Ведение журнала попыток несанкционированного доступа
      console.error(
        "ВНИМАНИЕ: Попытка доступа к административным функциям пользователем без прав:",
        {
          userId: req.user._id,
          userRole: userRole,
          path: req.originalUrl,
          method: req.method,
        }
      );

      return res
        .status(403)
        .json({ message: "Доступ запрещен. Требуются права администратора" });
    }

    console.log("Доступ разрешен. Пользователь имеет права администратора.");
    next();
  } catch (error) {
    console.error("Ошибка в middleware проверки прав:", error);
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

export { protect, admin };
