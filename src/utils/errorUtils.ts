import axios, { AxiosError } from "axios";

/**
 * Обрабатывает и логирует ошибки API запросов
 * @param error Ошибка из axios запроса
 * @param context Дополнительный контекст для логирования
 */
export const handleApiError = (error: unknown, context: string = ""): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    console.error(`API ошибка в ${context}:`, error);

    if (axiosError.response) {
      console.error("Статус ошибки:", axiosError.response.status);
      console.error("Данные ошибки:", axiosError.response.data);
    } else if (axiosError.request) {
      console.error("Ошибка запроса (нет ответа):", axiosError.request);
    } else {
      console.error("Ошибка запроса:", axiosError.message);
    }
  } else {
    console.error(`Неизвестная ошибка в ${context}:`, error);
  }

  throw error;
};
