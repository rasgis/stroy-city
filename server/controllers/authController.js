import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Регистрация пользователя
export const register = async (req, res) => {
  try {
    const { name, email, login, password, role } = req.body;

    // Проверка существования пользователя
    let user = await User.findOne({ $or: [{ email }, { login }] });
    if (user) {
      return res.status(400).json({
        message: "Пользователь с таким email или логином уже существует",
      });
    }

    // Создание нового пользователя
    user = new User({
      name,
      email,
      login,
      password,
      // Используем роль из запроса только если это "admin", иначе "user"
      role: "user", // Для регистрации всегда устанавливаем роль "user"
    });

    // Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    console.log(
      `Зарегистрирован новый пользователь: ${email}, роль: ${user.role}`
    );

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
      { expiresIn: "24h" },
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
    console.error(err.message);
    res.status(500).send("Ошибка сервера");
  }
};

// Вход пользователя
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Поиск пользователя по email или login
    const user = await User.findOne({
      $or: [{ email: identifier }, { login: identifier }],
    });

    if (!user) {
      return res.status(400).json({ message: "Неверные учетные данные" });
    }

    // Проверка пароля
    const isMatch = await bcrypt.compare(password, user.password);
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
      { expiresIn: "24h" },
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
    console.error(err.message);
    res.status(500).send("Ошибка сервера");
  }
};
