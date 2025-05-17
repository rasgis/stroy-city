import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import {
  sendSuccess,
  sendCreated,
  sendBadRequest,
  sendUnauthorized,
  sendForbidden,
  checkEntityExistsOrFail,
  checkUniqueness,
  handleControllerError,
} from "../utils/controllerUtils/index.js";

// Форматирование данных пользователя для ответа
const formatUserResponse = (user, token) => {
  return {
    token,
    user: {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      login: user.login,
      role: user.role,
    },
  };
};

// Регистрация пользователя
export const register = asyncHandler(async (req, res) => {
  try {
    const { name, email, login, password } = req.body;

    // Проверка на наличие всех необходимых полей
    if (!name || !email || !login || !password) {
      return sendBadRequest(
        res,
        "Все поля (имя, email, логин, пароль) обязательны для заполнения"
      );
    }

    // Проверка уникальности email
    const isEmailUnique = await checkUniqueness(
      User,
      { email },
      res,
      "Пользователь с таким email уже существует"
    );

    if (!isEmailUnique) return;

    // Проверка уникальности логина
    const isLoginUnique = await checkUniqueness(
      User,
      { login },
      res,
      "Пользователь с таким логином уже существует"
    );

    if (!isLoginUnique) return;

    // Создание нового пользователя
    const user = await User.create({
      name,
      email,
      login,
      password,
      role: "user",
    });

    const token = generateToken(user._id);
    sendCreated(res, formatUserResponse(user, token));
  } catch (error) {
    handleControllerError(res, "регистрации", error, "пользователя");
  }
});

// Вход пользователя
export const login = asyncHandler(async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return sendBadRequest(res, "Необходимо указать логин/email и пароль");
    }

    // Поиск пользователя по email или логину
    const user = await User.findOne({
      $or: [{ email: identifier }, { login: identifier }],
    });

    if (!user) {
      return sendUnauthorized(res, "Неверные учетные данные");
    }

    // Проверка пароля
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendUnauthorized(res, "Неверные учетные данные");
    }

    const token = generateToken(user._id);
    sendSuccess(res, formatUserResponse(user, token));
  } catch (error) {
    handleControllerError(res, "входе", error, "пользователя");
  }
});

// Получение профиля пользователя
export const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await checkEntityExistsOrFail(
      res,
      User,
      req.user._id,
      {},
      "Пользователь"
    );

    if (!user) return;

    sendSuccess(res, {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      login: user.login,
      role: user.role,
    });
  } catch (error) {
    handleControllerError(res, "получении профиля", error, "пользователя");
  }
});

// Обновление профиля пользователя
export const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return sendUnauthorized(res, "Пользователь не аутентифицирован");
    }

    const { name, password, role } = req.body;

    // Запрет на изменение роли через API профиля
    if (role) {
      return sendForbidden(res, "Изменение роли через API профиля запрещено");
    }

    const user = await checkEntityExistsOrFail(
      res,
      User,
      req.user._id,
      {},
      "Пользователь"
    );

    if (!user) return;

    // Обновление разрешенных полей
    if (name) user.name = name;
    if (password) user.password = password;

    const updatedUser = await user.save();
    const token = generateToken(updatedUser._id);

    sendSuccess(res, formatUserResponse(updatedUser, token));
  } catch (error) {
    handleControllerError(res, "обновлении профиля", error, "пользователя");
  }
});

// Удаление профиля пользователя
export const deleteUserProfile = asyncHandler(async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return sendUnauthorized(res, "Пользователь не аутентифицирован");
    }

    const user = await checkEntityExistsOrFail(
      res,
      User,
      req.user._id,
      {},
      "Пользователь"
    );

    if (!user) return;

    // Удаляем пользователя из базы данных
    await user.deleteOne();

    sendSuccess(res, { message: "Ваш аккаунт был успешно удален" });
  } catch (error) {
    handleControllerError(res, "удалении профиля", error, "пользователя");
  }
});
