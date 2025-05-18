export const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json(data);
};

export const sendCreated = (res, data) => {
  sendSuccess(res, data, 201);
};

export const sendMessage = (res, message, statusCode = 200) => {
  res.status(statusCode).json({ message });
};

export const sendError = (res, message, statusCode = 500) => {
  res.status(statusCode).json({ message });
};

export const sendNotFound = (res, message = "Ресурс не найден") => {
  sendError(res, message, 404);
};

export const sendBadRequest = (res, message) => {
  sendError(res, message, 400);
};

export const sendForbidden = (res, message = "Доступ запрещен") => {
  sendError(res, message, 403);
};

export const sendUnauthorized = (res, message = "Требуется авторизация") => {
  sendError(res, message, 401);
};

export const handleControllerError = (
  res,
  operation,
  error,
  entityType = ""
) => {
  const entityPrefix = entityType ? `${entityType}: ` : "";
  console.error(
    `Ошибка при ${operation}${entityType ? ` ${entityType}` : ""}:`,
    error
  );
  sendError(res, `${entityPrefix}Ошибка при ${operation}: ${error.message}`);
};
