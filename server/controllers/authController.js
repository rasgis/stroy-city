import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Регистрация пользователя
export const register = async (req, res) => {
  try {
    const { name, email, login, password, role } = req.body;

    // Проверка на наличие всех необходимых полей
    if (!name || !email || !login || !password) {
      return res.status(400).json({
        message:
          "Все поля (имя, email, логин, пароль) обязательны для заполнения",
      });
    }

    // Проверка существования пользователя по email
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        message: "Пользователь с таким email уже существует",
      });
    }

    // Проверка существования пользователя по логину
    const loginExists = await User.findOne({ login });
    if (loginExists) {
      return res.status(400).json({
        message: "Пользователь с таким логином уже существует",
      });
    }

    // Создание нового пользователя
    const user = new User({
      name,
      email,
      login,
      password, // Пароль будет автоматически хеширован pre-save хуком
      role: "user", // Для регистрации всегда устанавливаем роль "user"
    });

    // Сохраняем пользователя - хеширование произойдет автоматически в pre-save хуке
    await user.save();

    // Создание JWT токена
    const payload = {
      user: {
        id: user._id,
        role: user.role,
      },
    };

    // Подготовка данных о пользователе для отправки клиенту
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      login: user.login,
      role: user.role,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: userData,
        });
      }
    );
  } catch (err) {
    console.error("Ошибка при регистрации:", err.message);
    res
      .status(500)
      .json({ message: "Ошибка сервера при регистрации пользователя" });
  }
};

// Вход пользователя
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "Необходимо указать логин/email и пароль" });
    }

    // Поиск пользователя по email или login
    const user = await User.findOne({
      $or: [{ email: identifier }, { login: identifier }],
    });

    if (!user) {
      return res.status(400).json({ message: "Неверные учетные данные" });
    }

    // Проверка пароля
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Неверные учетные данные" });
    }

    // Создание JWT токена
    const payload = {
      user: {
        id: user._id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            login: user.login,
            role: user.role,
          },
        });
      }
    );
  } catch (err) {
    console.error("Ошибка при входе:", err.message);
    res.status(500).json({ message: "Ошибка сервера при входе в систему" });
  }
};
