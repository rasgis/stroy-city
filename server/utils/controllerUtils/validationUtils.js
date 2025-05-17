import { sendBadRequest } from "./responseUtils.js";

/**
 * Проверяет наличие обязательных полей в запросе
 * @param {Object} req - Express request объект
 * @param {Object} res - Express response объект
 * @param {Array} fields - Массив обязательных полей
 * @param {String} customMessage - Пользовательское сообщение об ошибке
 * @returns {Boolean} - true если все поля существуют, false если отправлено сообщение об ошибке
 */
export const validateRequiredFields = (
  req,
  res,
  fields,
  customMessage = null
) => {
  const missingFields = fields.filter((field) => !req.body[field]);

  if (missingFields.length > 0) {
    let message = customMessage;

    if (!message) {
      if (missingFields.length === 1) {
        message = `Поле "${missingFields[0]}" обязательно для заполнения`;
      } else {
        message = `Следующие поля обязательны для заполнения: ${missingFields
          .map((f) => `"${f}"`)
          .join(", ")}`;
      }
    }

    sendBadRequest(res, message);
    return false;
  }

  return true;
};

/**
 * Проверяет, что числовое поле больше или равно минимальному значению
 * @param {Object} req - Express request объект
 * @param {Object} res - Express response объект
 * @param {String} field - Имя поля для проверки
 * @param {Number} minValue - Минимальное допустимое значение
 * @param {String} customMessage - Пользовательское сообщение об ошибке
 * @returns {Boolean} - true если проверка пройдена, false если отправлено сообщение об ошибке
 */
export const validateMinValue = (
  req,
  res,
  field,
  minValue,
  customMessage = null
) => {
  if (req.body[field] < minValue) {
    const message =
      customMessage || `Поле "${field}" должно быть не менее ${minValue}`;
    sendBadRequest(res, message);
    return false;
  }

  return true;
};

/**
 * Проверяет, что строка соответствует формату электронной почты
 * @param {Object} req - Express request объект
 * @param {Object} res - Express response объект
 * @param {String} field - Имя поля для проверки
 * @param {String} customMessage - Пользовательское сообщение об ошибке
 * @returns {Boolean} - true если проверка пройдена, false если отправлено сообщение об ошибке
 */
export const validateEmail = (req, res, field, customMessage = null) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(req.body[field])) {
    const message =
      customMessage || `Неверный формат электронной почты в поле "${field}"`;
    sendBadRequest(res, message);
    return false;
  }

  return true;
};

/**
 * Проверяет, что пароль соответствует требованиям безопасности
 * @param {Object} req - Express request объект
 * @param {Object} res - Express response объект
 * @param {String} field - Имя поля для проверки
 * @param {Object} options - Опции проверки (minLength, requireNumbers, requireSymbols)
 * @returns {Boolean} - true если проверка пройдена, false если отправлено сообщение об ошибке
 */
export const validatePassword = (req, res, field, options = {}) => {
  const {
    minLength = 6,
    requireNumbers = true,
    requireSymbols = false,
    customMessage = null,
  } = options;

  const password = req.body[field];

  if (password.length < minLength) {
    sendBadRequest(
      res,
      customMessage || `Пароль должен содержать не менее ${minLength} символов`
    );
    return false;
  }

  if (requireNumbers && !/\d/.test(password)) {
    sendBadRequest(
      res,
      customMessage || "Пароль должен содержать хотя бы одну цифру"
    );
    return false;
  }

  if (requireSymbols && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    sendBadRequest(
      res,
      customMessage || "Пароль должен содержать хотя бы один специальный символ"
    );
    return false;
  }

  return true;
};
