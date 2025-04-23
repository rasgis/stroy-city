import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";

// @desc    Регистрация пользователя
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, login, password, role } = req.body;

  // Проверка на наличие всех необходимых полей
  if (!name || !email || !login || !password) {
    res.status(400);
    throw new Error(
      "Все поля (имя, email, логин, пароль) обязательны для заполнения"
    );
  }

  // Проверка существования пользователя по email
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    res.status(400);
    throw new Error("Пользователь с таким email уже существует");
  }

  // Проверка существования пользователя по логину
  const loginExists = await User.findOne({ login });
  if (loginExists) {
    res.status(400);
    throw new Error("Пользователь с таким логином уже существует");
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

  // Подготовка данных о пользователе для отправки клиенту
  const userData = {
    _id: user._id,
    id: user._id,
    name: user.name,
    email: user.email,
    login: user.login,
    role: user.role,
  };

  // Генерируем токен с помощью утилиты generateToken
  const token = generateToken(user._id);

  res.status(201).json({
    token,
    user: userData,
  });
});

// @desc    Вход пользователя
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    res.status(400);
    throw new Error("Необходимо указать логин/email и пароль");
  }

  // Поиск пользователя по email или login
  const user = await User.findOne({
    $or: [{ email: identifier }, { login: identifier }],
  });

  if (!user) {
    res.status(401);
    throw new Error("Неверные учетные данные");
  }

  // Проверка пароля
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Неверные учетные данные");
  }

  // Генерируем токен с помощью утилиты generateToken
  const token = generateToken(user._id);

  res.json({
    token,
    user: {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      login: user.login,
      role: user.role,
    },
  });
});

// @desc    Получение профиля пользователя
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      login: user.login,
      role: user.role,
    });
  } else {
    res.status(404);
    throw new Error("Пользователь не найден");
  }
});

// @desc    Обновление профиля пользователя
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  // Проверка наличия пользователя
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error("Пользователь не аутентифицирован");
  }

  // Получаем данные из запроса
  const { name, email, login, password, role } = req.body;

  // Проверяем, не пытается ли пользователь изменить свою роль
  if (role) {
    res.status(403);
    throw new Error("Изменение роли через API профиля запрещено");
  }

  // Поиск пользователя в базе
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("Пользователь не найден");
  }

  // Обновляем поля пользователя
  if (name) user.name = name;

  // Проверка уникальности email
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error("Пользователь с таким email уже существует");
    }
    user.email = email;
  }

  // Проверка уникальности логина
  if (login && login !== user.login) {
    const loginExists = await User.findOne({ login });
    if (loginExists) {
      res.status(400);
      throw new Error("Пользователь с таким логином уже существует");
    }
    user.login = login;
  }

  // Обновляем пароль, если он предоставлен
  if (password) {
    user.password = password;
  }

  // Роль сохраняем неизменной - защита от повышения привилегий

  const updatedUser = await user.save();

  // Создаем новый токен
  const token = generateToken(updatedUser._id);

  // Возвращаем данные пользователя
  res.json({
    _id: updatedUser._id,
    id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    login: updatedUser.login,
    role: updatedUser.role,
    token,
  });
});
