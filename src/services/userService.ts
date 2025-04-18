import axios from "axios";
import { API_CONFIG } from "../config/api";
import { User, UserCreateData, UserUpdateData } from "../types/user";
import { authService } from "./authService";

// Сервис для работы с пользователями
export const userService = {
  // Получение всех пользователей
  async getAllUsers(): Promise<User[]> {
    try {
      const token = authService.getToken();

      if (!token) {
        throw new Error(
          "Необходима авторизация для получения списка пользователей"
        );
      }

      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS.BASE}`,
        {
          headers: {
            ...API_CONFIG.HEADERS,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Ошибка при получении пользователей: ${
            error.response?.data?.message || error.message
          }`
        );
      }
      throw error;
    }
  },

  // Получение пользователя по ID
  async getUserById(id: string): Promise<User> {
    try {
      const token = authService.getToken();

      if (!token) {
        throw new Error("Необходима авторизация для получения пользователя");
      }

      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS.BY_ID(id)}`,
        {
          headers: {
            ...API_CONFIG.HEADERS,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Ошибка при получении пользователя: ${
            error.response?.data?.message || error.message
          }`
        );
      }
      throw error;
    }
  },

  // Создание нового пользователя (только для администраторов)
  async createUser(userData: UserCreateData): Promise<User> {
    try {
      const token = authService.getToken();

      if (!token) {
        throw new Error("Необходима авторизация для создания пользователя");
      }

      // Проверяем, что роль валидная
      const validUserData = {
        ...userData,
        role: userData.role === "admin" ? "admin" : "user",
      };

      console.log("Отправка запроса на создание пользователя:", validUserData);

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS.BASE}`,
        validUserData,
        {
          headers: {
            ...API_CONFIG.HEADERS,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Ответ сервера при создании пользователя:", response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Ошибка axios при создании пользователя:",
          error.response?.data || error.message
        );
        throw new Error(
          `Ошибка при создании пользователя: ${
            error.response?.data?.message || error.message
          }`
        );
      }
      console.error("Неизвестная ошибка при создании пользователя:", error);
      throw error;
    }
  },

  // Обновление пользователя
  async updateUser(id: string, userData: UserUpdateData): Promise<User> {
    try {
      const token = authService.getToken();

      if (!token) {
        throw new Error("Необходима авторизация для обновления пользователя");
      }

      const response = await axios.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS.BY_ID(id)}`,
        userData,
        {
          headers: {
            ...API_CONFIG.HEADERS,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Ошибка при обновлении пользователя: ${
            error.response?.data?.message || error.message
          }`
        );
      }
      throw error;
    }
  },

  // Удаление пользователя
  async deleteUser(id: string): Promise<{ message: string }> {
    try {
      const token = authService.getToken();

      if (!token) {
        throw new Error("Необходима авторизация для удаления пользователя");
      }

      const response = await axios.delete(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS.BY_ID(id)}`,
        {
          headers: {
            ...API_CONFIG.HEADERS,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Ошибка при удалении пользователя: ${
            error.response?.data?.message || error.message
          }`
        );
      }
      throw error;
    }
  },
};
