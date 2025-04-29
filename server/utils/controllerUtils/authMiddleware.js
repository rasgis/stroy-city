import pkg from "express";
const { Response, NextFunction } = pkg;

/**
 * Проверяет авторизацию пользователя
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @param {Object} options
 * @returns {Object|void} Ответ об ошибке или вызывает next()
 */
export const checkAuth = (req, res, next, options = {}) => {
  const { requireAdmin = false } = options;

  if (!req.user) {
    res.status(401).json({ message: "Требуется авторизация" });
    return;
  }

  if (requireAdmin && req.user.role !== "admin") {
    res
      .status(403)
      .json({ message: "Доступ запрещен. Требуются права администратора." });
    return;
  }

  next();
};

/**
 * Создает middleware для проверки авторизации
 * @param {Object} options Опции проверки
 * @returns {Function} Функция middleware
 */
export const createAuthMiddleware = (options = {}) => {
  return (req, res, next) => checkAuth(req, res, next, options);
};

/**
 * Готовый middleware для проверки прав администратора
 */
export const requireAdmin = createAuthMiddleware({ requireAdmin: true });
