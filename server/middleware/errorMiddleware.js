/**
 * Middleware для обработки несуществующих маршрутов (404)
 * Генерирует ошибку для несуществующих маршрутов и передает ее далее
 *
 * @param {object} req - Express request объект
 * @param {object} res - Express response объект
 * @param {function} next - Express next функция
 */
const notFound = (req, res, next) => {
  console.log(`[Error Middleware] Маршрут не найден: ${req.originalUrl}`);
  const error = new Error(`Маршрут ${req.originalUrl} не найден`);
  res.status(404);
  next(error);
};

/**
 * Middleware для обработки и форматирования ошибок
 * Возвращает стандартизированный JSON-ответ с сообщением об ошибке
 *
 * @param {object} err - Объект ошибки
 * @param {object} req - Express request объект
 * @param {object} res - Express response объект
 * @param {function} next - Express next функция
 */
const errorHandler = (err, req, res, next) => {
  // Установка статус-кода (если statusCode уже 200, то используем 500)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  console.log(`[Error Middleware] Ошибка ${statusCode}: ${err.message}`);

  // Возвращаем JSON с ошибкой
  res.status(statusCode).json({
    message: err.message,
    // Стек ошибки только в режиме разработки
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export { notFound, errorHandler };
