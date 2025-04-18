import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

// @desc    Авторизация пользователя и получение токена
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  // Проверяем, является ли identifier email или логином
  const isEmail = identifier.includes("@");

  // Поиск пользователя по email или логину
  const user = isEmail
    ? await User.findOne({ email: identifier })
    : await User.findOne({ login: identifier });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      login: user.login,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Неверный email/логин или пароль");
  }
});

// @desc    Регистрация нового пользователя
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, login, password } = req.body;

  const emailExists = await User.findOne({ email });
  const loginExists = await User.findOne({ login });

  if (emailExists) {
    res.status(400);
    throw new Error("Пользователь с таким email уже существует");
  }

  if (loginExists) {
    res.status(400);
    throw new Error("Пользователь с таким логином уже существует");
  }

  const user = await User.create({
    name,
    email,
    login,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      login: user.login,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Некорректные данные пользователя");
  }
});

// @desc    Получение профиля пользователя
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
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
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;

    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        res.status(400);
        throw new Error("Пользователь с таким email уже существует");
      }
      user.email = req.body.email;
    }

    if (req.body.login && req.body.login !== user.login) {
      const loginExists = await User.findOne({ login: req.body.login });
      if (loginExists) {
        res.status(400);
        throw new Error("Пользователь с таким логином уже существует");
      }
      user.login = req.body.login;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      login: updatedUser.login,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error("Пользователь не найден");
  }
});

// @desc    Получение всех пользователей
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.json(users);
});

// @desc    Получение пользователя по ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("Пользователь не найден");
  }
});

// @desc    Обновление пользователя
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;

    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists && emailExists._id.toString() !== req.params.id) {
        res.status(400);
        throw new Error("Пользователь с таким email уже существует");
      }
      user.email = req.body.email;
    }

    if (req.body.login && req.body.login !== user.login) {
      const loginExists = await User.findOne({ login: req.body.login });
      if (loginExists && loginExists._id.toString() !== req.params.id) {
        res.status(400);
        throw new Error("Пользователь с таким логином уже существует");
      }
      user.login = req.body.login;
    }

    if (req.body.role) {
      user.role = req.body.role;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      login: updatedUser.login,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error("Пользователь не найден");
  }
});

// @desc    Удаление пользователя
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // Запрещаем удалять самого себя
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error("Нельзя удалить своего пользователя");
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
