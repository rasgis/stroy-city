import axios, { AxiosError } from "axios";

const extractErrorMessage = (responseData: any): string => {
  if (responseData.message) {
    const message = responseData.message;

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
    return responseData.errors
      .map((err: any) => err.msg || err.message)
      .join(". ");
  }

  return "Произошла ошибка при выполнении запроса";
};

export const handleApiError = (error: unknown, context: string = ""): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    console.error(`API ошибка в ${context}:`, error);

    if (axiosError.response) {
      console.error("Статус ошибки:", axiosError.response.status);
      console.error("Данные ошибки:", axiosError.response.data);

      const responseData = axiosError.response.data as any;

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

  throw new Error("Произошла непредвиденная ошибка");
};

export const formatErrorMessage = (error: unknown): string => {
  if (!error) return "Произошла неизвестная ошибка";

  if (typeof error === "string") return error;

  if (error instanceof Error) return error.message;

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data) {
      return extractErrorMessage(axiosError.response.data);
    }
    return axiosError.message || "Ошибка при выполнении сетевого запроса";
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Произошла ошибка, подробности недоступны";
  }
};
