const notFound = (req, res, next) => {
  console.log(`[Error Middleware] Маршрут не найден: ${req.originalUrl}`);
  const error = new Error(`Маршрут ${req.originalUrl} не найден`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  console.log(`[Error Middleware] Ошибка ${statusCode}: ${err.message}`);

  res.status(statusCode).json({
    message: err.message,
    stack: err.stack,
  });
};

export { notFound, errorHandler };
