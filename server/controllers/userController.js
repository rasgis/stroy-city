import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

/**
 * @desc    Аутентификация пользователя и получение токена
 * @route   POST /api/users/login
 * @access  Публичный
 * @param   {string} req.body.email - Email пользователя
 * @param   {string} req.body.password - Пароль пользователя
 * @returns {Object} Данные пользователя и токен
 */
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Пожалуйста, заполните все поля");
  }

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      login: user.login,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Неверный email или пароль");
  }
});

/**
 * @desc    Регистрация нового пользователя
 * @route   POST /api/users
 * @access  Публичный
 * @param   {string} req.body.name - Имя пользователя
 * @param   {string} req.body.login - Логин пользователя
 * @param   {string} req.body.email - Email пользователя
 * @param   {string} req.body.password - Пароль пользователя
 * @returns {Object} Данные созданного пользователя и токен
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, login, email, password } = req.body;

  // Проверка наличия всех полей
  if (!name || !login || !email || !password) {
    res.status(400);
    throw new Error("Пожалуйста, заполните все поля");
  }

  // Проверка существования пользователя с таким email
  const userExists = await User.findOne({ $or: [{ email }, { login }] });

  if (userExists) {
    if (userExists.email === email) {
      res.status(400);
      throw new Error("Пользователь с таким email уже существует");
    }
    if (userExists.login === login) {
      res.status(400);
      throw new Error("Пользователь с таким логином уже существует");
    }
  }

  // Создание нового пользователя
  const user = await User.create({
    name,
    login,
    email,
    password,
  });

  // Возвращение данных пользователя и токена
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      login: user.login,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Ошибка при создании пользователя");
  }
});

/**
 * @desc    Получение профиля пользователя
 * @route   GET /api/users/profile
 * @access  Приватный
 * @returns {Object} Данные пользователя
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      login: user.login,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(404);
    throw new Error("Пользователь не найден");
  }
});

/**
 * @desc    Обновление профиля пользователя
 * @route   PUT /api/users/profile
 * @access  Приватный
 * @param   {string} [req.body.name] - Новое имя пользователя
 * @param   {string} [req.body.login] - Новый логин пользователя
 * @param   {string} [req.body.email] - Новый email пользователя
 * @param   {string} [req.body.password] - Новый пароль пользователя
 * @returns {Object} Обновленные данные пользователя и токен
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  // Проверяем аутентификацию
  if (!req.user) {
    res.status(401);
    throw new Error("Не авторизован");
  }

  // Получаем данные из запроса
  const { name, login, email, password } = req.body;

  console.log("Received data:", { name, login, email, password: "***" });

  // Если пытаются изменить роль
  if (req.body.role) {
    console.log(`Attempt to change role detected for user ${req.user._id}`);
    res.status(403);
    throw new Error("Изменение роли не разрешено");
  }

  // Получаем текущего пользователя
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("Пользователь не найден");
  }

  // Проверяем, если пользователь меняет логин или email, нет ли уже таких значений у других пользователей
  if (login && login !== user.login) {
    const userWithSameLogin = await User.findOne({ login });
    if (userWithSameLogin) {
      res.status(400);
      throw new Error("Пользователь с таким логином уже существует");
    }
  }

  if (email && email !== user.email) {
    const userWithSameEmail = await User.findOne({ email });
    if (userWithSameEmail) {
      res.status(400);
      throw new Error("Пользователь с таким email уже существует");
    }
  }

  // Обновляем данные пользователя
  user.name = name || user.name;
  user.login = login || user.login;
  user.email = email || user.email;
  if (password) {
    user.password = password;
  }

  try {
    // Сохраняем обновленного пользователя
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      login: updatedUser.login,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500);
    throw new Error(`Ошибка обновления пользователя: ${error.message}`);
  }
});

/**
 * @desc    Получение всех пользователей
 * @route   GET /api/users
 * @access  Приватный/Админ
 * @returns {Array} Массив пользователей
 */
const getUsers = asyncHandler(async (req, res) => {
  // Проверяем права доступа
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    throw new Error("Доступ запрещен. Требуются права администратора.");
  }

  const users = await User.find({}).select("-password");
  res.json(users);
});

/**
 * @desc    Получение пользователя по ID
 * @route   GET /api/users/:id
 * @access  Приватный/Админ
 * @param   {string} req.params.id - ID пользователя
 * @returns {Object} Данные пользователя
 */
const getUserById = asyncHandler(async (req, res) => {
  // Проверяем права доступа
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    throw new Error("Доступ запрещен. Требуются права администратора.");
  }

  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("Пользователь не найден");
  }
});

/**
 * @desc    Обновление пользователя админом
 * @route   PUT /api/users/:id
 * @access  Приватный/Админ
 * @param   {string} req.params.id - ID пользователя
 * @param   {Object} req.body - Данные для обновления пользователя
 * @returns {Object} Обновленные данные пользователя
 */
const updateUser = asyncHandler(async (req, res) => {
  // Проверяем права доступа
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    throw new Error("Доступ запрещен. Требуются права администратора.");
  }

  const user = await User.findById(req.params.id);

  if (user) {
    // Обновляем поля пользователя
    user.name = req.body.name || user.name;
    user.login = req.body.login || user.login;
    user.email = req.body.email || user.email;

    // Обновляем роль только если она предоставлена
    if (req.body.role) {
      user.role = req.body.role;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      login: updatedUser.login,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error("Пользователь не найден");
  }
});

/**
 * @desc    Удаление пользователя
 * @route   DELETE /api/users/:id
 * @access  Приватный/Админ
 * @param   {string} req.params.id - ID пользователя для удаления
 * @returns {Object} Сообщение об успешном удалении
 */
const deleteUser = asyncHandler(async (req, res) => {
  // Проверяем права доступа
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    throw new Error("Доступ запрещен. Требуются права администратора.");
  }

  const user = await User.findById(req.params.id);

  if (user) {
    // Предотвращаем удаление себя (текущего админа)
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error("Невозможно удалить собственную учетную запись");
    }

    await user.deleteOne();
    res.json({ message: "Пользователь удален" });
  } else {
    res.status(404);
    throw new Error("Пользователь не найден");
  }
});

export {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
