import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { handleApiError } from "../../utils/errorUtils";
import { prepareDataForApi } from "../../utils/apiUtils";
import { API_CONFIG } from "../../config/api";
import { TOKEN_KEY } from "../../utils/securityUtils";

export abstract class BaseService {
  protected baseUrl: string = API_CONFIG.BASE_URL;
  protected getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem(TOKEN_KEY);
    return {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    };
  }

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
