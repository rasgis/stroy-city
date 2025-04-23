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

  // Обновление профиля текущего пользователя
  async updateUserProfile(userData: UserUpdateData): Promise<User> {
    try {
      const token = authService.getToken();

      if (!token) {
        throw new Error("Необходима авторизация для обновления профиля");
      }

      // Получаем текущего пользователя
      const currentUser = authService.getUser();

      // Проверяем попытку изменения роли - это критическая уязвимость безопасности
      if (userData.role) {
        console.error(
          "ПРЕДУПРЕЖДЕНИЕ: Попытка изменить роль через API профиля:",
          {
            userData,
            currentRole: currentUser?.role,
          }
        );

        // Удаляем роль из данных перед отправкой на сервер
        delete userData.role;
      }

      console.log("Токен авторизации:", token ? "присутствует" : "отсутствует");
      console.log(
        "Данные для отправки (после проверки безопасности):",
        userData
      );

      // Обновлен маршрут после рефакторинга сервера от 2024-06-24
      // Используем /api/auth/profile вместо /api/users/profile
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.PROFILE}`;
      console.log("URL запроса:", url);

      const response = await axios.put(url, userData, {
        headers: {
          ...API_CONFIG.HEADERS,
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Ответ сервера:", response.status, response.statusText);

      // Обновляем данные пользователя в localStorage, если они изменились
      if (currentUser && response.data) {
        // Важно! Убедимся, что роль не изменилась по сравнению с текущей
        const updatedUser = {
          ...currentUser,
          ...response.data,
          id: response.data._id || response.data.id || currentUser.id,
          // Если роль вернулась измененной, используем текущую роль пользователя
          role: currentUser.role,
        };
        authService.setAuthData(response.data.token || token, updatedUser);
      }

      return response.data;
    } catch (error) {
      console.error("Ошибка при обновлении профиля:", error);

      // Подробный вывод ошибки для диагностики
      if (axios.isAxiosError(error)) {
        console.error("Детали ошибки:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });

        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Неизвестная ошибка";

        throw new Error(`Ошибка при обновлении профиля: ${errorMessage}`);
      }

      throw error;
    }
  },
};
