import axios, { AxiosError } from "axios";

/**
 * Извлекает понятное сообщение об ошибке из ответа сервера
 * @param responseData Данные ответа от сервера
 * @returns Человекочитаемое сообщение об ошибке
 */
const extractErrorMessage = (responseData: any): string => {
  // Проверяем разные форматы сообщений об ошибках
  if (responseData.message) {
    const message = responseData.message;

    // Специальная обработка для ошибок регистрации пользователя
    if (message.includes("email уже существует")) {
      return "Пользователь с таким email уже зарегистрирован. Пожалуйста, используйте другой email или выполните вход.";
    }

    if (message.includes("логином уже существует")) {
      return "Пользователь с таким логином уже зарегистрирован. Пожалуйста, выберите другой логин.";
    }

    return message;
  } else if (responseData.error) {
    if (typeof responseData.error === "string") {
      return responseData.error;
    } else if (responseData.error.message) {
      return responseData.error.message;
    }
  } else if (responseData.errors && Array.isArray(responseData.errors)) {
    // Для массива ошибок, например, от валидатора
    return responseData.errors
      .map((err: any) => err.msg || err.message)
      .join(". ");
  }

  // Если не удалось найти сообщение в стандартных местах
  return "Произошла ошибка при выполнении запроса";
};

/**
 * Обрабатывает и логирует ошибки API запросов
 * @param error Ошибка из axios запроса
 * @param context Дополнительный контекст для логирования
 * @returns Выбрасывает ошибку с понятным сообщением
 */
export const handleApiError = (error: unknown, context: string = ""): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    // Для отладки все еще логируем в консоль, но не показываем пользователю
    console.error(`API ошибка в ${context}:`, error);

    if (axiosError.response) {
      console.error("Статус ошибки:", axiosError.response.status);
      console.error("Данные ошибки:", axiosError.response.data);

      // Извлекаем сообщение об ошибке из ответа сервера
      const responseData = axiosError.response.data as any;

      // Формируем сообщение в зависимости от статуса и данных
      let errorMessage: string;

      switch (axiosError.response.status) {
        case 400:
          errorMessage = extractErrorMessage(responseData);
          break;
        case 401:
          errorMessage =
            "Требуется авторизация. Пожалуйста, войдите в систему.";
          break;
        case 403:
          errorMessage = "У вас нет прав для выполнения этого действия.";
          break;
        case 404:
          errorMessage = "Запрашиваемый ресурс не найден.";
          break;
        case 409:
          errorMessage =
            extractErrorMessage(responseData) ||
            "Конфликт данных. Возможно, такая запись уже существует.";
          break;
        case 422:
          errorMessage =
            extractErrorMessage(responseData) || "Ошибка валидации данных.";
          break;
        case 500:
        case 502:
        case 503:
          errorMessage = "Ошибка сервера. Пожалуйста, попробуйте позже.";
          break;
        default:
          errorMessage = extractErrorMessage(responseData);
      }

      const errorWithCustomMessage = new Error(errorMessage);
      // Копируем свойства оригинальной ошибки
      Object.assign(errorWithCustomMessage, error);
      throw errorWithCustomMessage;
    } else if (axiosError.request) {
      console.error("Ошибка запроса (нет ответа):", axiosError.request);
      throw new Error(
        "Не удалось получить ответ от сервера. Проверьте подключение к интернету."
      );
    } else {
      console.error("Ошибка запроса:", axiosError.message);
      throw new Error(
        axiosError.message || "Произошла ошибка при выполнении запроса"
      );
    }
  } else {
    console.error(`Неизвестная ошибка в ${context}:`, error);
    if (error instanceof Error) {
      throw error;
    }
  }

  // Если не удалось извлечь более конкретное сообщение, возвращаем общую ошибку
  throw new Error("Произошла непредвиденная ошибка");
};
