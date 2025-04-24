import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { handleApiError } from "../../utils/errorUtils";
import { prepareDataForApi } from "../../utils/apiUtils";
import { API_CONFIG } from "../../config/api";

// Константа для ключа токена в localStorage (такая же как в authService)
const TOKEN_KEY = "token";

/**
 * Базовый класс для всех сервисов API
 */
export abstract class BaseService {
  /**
   * Базовый URL для API-запросов
   */
  protected baseUrl: string = API_CONFIG.BASE_URL;

  /**
   * Получает HTTP-заголовки для авторизованных запросов
   */
  protected getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem(TOKEN_KEY);
    return {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    };
  }

  /**
   * Выполняет GET-запрос
   * @param endpoint Конечная точка API
   * @param config Конфигурация запроса
   * @returns Промис с ответом
   */
  protected async get<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response: AxiosResponse<T> = await axios.get(url, {
        headers: this.getAuthHeaders(),
        ...config,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, `GET ${endpoint}`);
    }
  }

  /**
   * Выполняет POST-запрос
   * @param endpoint Конечная точка API
   * @param data Данные для отправки
   * @param config Конфигурация запроса
   * @returns Промис с ответом
   */
  protected async post<T>(
    endpoint: string,
    data: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const preparedData = prepareDataForApi(data);
      const response: AxiosResponse<T> = await axios.post(url, preparedData, {
        headers: this.getAuthHeaders(),
        ...config,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, `POST ${endpoint}`);
    }
  }

  /**
   * Выполняет PUT-запрос
   * @param endpoint Конечная точка API
   * @param data Данные для отправки
   * @param config Конфигурация запроса
   * @returns Промис с ответом
   */
  protected async put<T>(
    endpoint: string,
    data: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const preparedData = prepareDataForApi(data);
      const response: AxiosResponse<T> = await axios.put(url, preparedData, {
        headers: this.getAuthHeaders(),
        ...config,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, `PUT ${endpoint}`);
    }
  }

  /**
   * Выполняет DELETE-запрос
   * @param endpoint Конечная точка API
   * @param config Конфигурация запроса
   * @returns Промис с ответом
   */
  protected async delete<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response: AxiosResponse<T> = await axios.delete(url, {
        headers: this.getAuthHeaders(),
        ...config,
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, `DELETE ${endpoint}`);
    }
  }
}
