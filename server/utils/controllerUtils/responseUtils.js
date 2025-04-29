/**
 * Утилита для формирования стандартизированных ответов API
 */

/**
 * Отправляет успешный ответ
 * @param {Object} res - Express response объект
 * @param {Object|Array} data - Данные для отправки
 * @param {Number} statusCode - HTTP статус код (по умолчанию 200)
 */
export const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json(data);
};

/**
 * Отправляет ответ об успешном создании ресурса
 * @param {Object} res - Express response объект
 * @param {Object|Array} data - Данные созданного ресурса
 */
export const sendCreated = (res, data) => {
  sendSuccess(res, data, 201);
};

/**
 * Отправляет сообщение об успешном действии
 * @param {Object} res - Express response объект
 * @param {String} message - Сообщение об успехе
 * @param {Number} statusCode - HTTP статус код (по умолчанию 200)
 */
export const sendMessage = (res, message, statusCode = 200) => {
  res.status(statusCode).json({ message });
};

/**
 * Отправляет ответ с ошибкой
 * @param {Object} res - Express response объект
 * @param {String} message - Сообщение об ошибке
 * @param {Number} statusCode - HTTP статус код ошибки (по умолчанию 500)
 */
export const sendError = (res, message, statusCode = 500) => {
  res.status(statusCode).json({ message });
};

/**
 * Отправляет ответ "Ресурс не найден"
 * @param {Object} res - Express response объект
 * @param {String} message - Сообщение об ошибке (по умолчанию "Ресурс не найден")
 */
export const sendNotFound = (res, message = "Ресурс не найден") => {
  sendError(res, message, 404);
};

/**
 * Отправляет ответ "Неверный запрос"
 * @param {Object} res - Express response объект
 * @param {String} message - Сообщение об ошибке
 */
export const sendBadRequest = (res, message) => {
  sendError(res, message, 400);
};

/**
 * Отправляет ответ "Доступ запрещен"
 * @param {Object} res - Express response объект
 * @param {String} message - Сообщение об ошибке (по умолчанию "Доступ запрещен")
 */
export const sendForbidden = (res, message = "Доступ запрещен") => {
  sendError(res, message, 403);
};

/**
 * Отправляет ответ "Ошибка авторизации"
 * @param {Object} res - Express response объект
 * @param {String} message - Сообщение об ошибке (по умолчанию "Требуется авторизация")
 */
export const sendUnauthorized = (res, message = "Требуется авторизация") => {
  sendError(res, message, 401);
};
