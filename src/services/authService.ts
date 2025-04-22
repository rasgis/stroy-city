import axios from "axios";
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
} from "../types/auth";
import { API_CONFIG } from "../config/api";

const TOKEN_KEY = "token";
const USER_KEY = "user";
const ROLE_KEY = "role";

export const authService = {
  // Сохранение токена и данных пользователя
  setAuthData(token: string, user: User | any) {
    // Проверка и нормализация ID пользователя
    const normalizedUser = {
      ...user,
      // Используем _id или id из ответа сервера
      id: user._id || user.id || "",
      // Гарантируем, что имя будет установлено
      name: user.name || "",
    };

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));

    // Сохраняем роль пользователя, если она есть
    if (normalizedUser.role) {
      localStorage.setItem(ROLE_KEY, normalizedUser.role);
    }
  },

  // Получение токена
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Получение данных пользователя
  getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Очистка данных авторизации
  clearAuthData() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
  },

  // Проверка авторизации
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`,
        credentials,
        {
          headers: API_CONFIG.HEADERS
        }
      );

      // Сохраняем данные пользователя, включая _id или id
      const user = response.data.user;
      
      // Убедимся, что все поля пользователя корректно копируются
      const userToSave = {
        ...user,
        id: user._id || user.id || "", // Сохраняем _id или id
        name: user.name || "", // Явно указываем имя
        email: user.email || "",
        login: user.login || "",
        role: user.role || "user"
      };

      // Используем метод setAuthData для унификации сохранения данных
      this.setAuthData(response.data.token, userToSave);

      return {
        ...response.data,
        user: userToSave // Возвращаем обработанного пользователя
      };
    } catch (error) {
      console.error("Ошибка входа:", error);
      
      // Улучшаем обработку ошибок, возвращая более информативное сообщение
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw error;
    }
  },

  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      // Явно задаем роль "user" для нового пользователя
      const userData = {
        name: credentials.name,
        email: credentials.email,
        login: credentials.login,
        password: credentials.password,
        role: "user", // Принудительно устанавливаем роль "user"
      };

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`,
        userData,
        {
          headers: API_CONFIG.HEADERS,
        }
      );

      // Проверяем, что response.data содержит все необходимые поля
      if (!response.data || !response.data.token) {
        throw new Error("Неверный формат ответа от сервера");
      }

      const { token, user } = response.data;

      // Сохраняем данные пользователя, включая _id или id
      const userToSave = {
        ...user,
        id: user._id || user.id || "", // Сохраняем _id или id
        name: user.name || credentials.name || "", // Используем имя из ответа или из отправленных данных
        email: user.email || credentials.email || "",
        login: user.login || credentials.login || "",
        role: user.role || "user"
      };

      // Сохраняем данные авторизации
      this.setAuthData(token, userToSave);

      return userToSave;
    } catch (error) {
      console.error("Ошибка при регистрации:", error);
      // Улучшаем обработку ошибок, возвращая более информативное сообщение
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  async getUserProfile(): Promise<User> {
    try {
      const token = this.getToken();

      if (!token) {
        throw new Error("Не авторизован");
      }

      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.PROFILE}`,
        {
          headers: {
            ...API_CONFIG.HEADERS,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Ошибка при получении профиля:", error);
      throw error;
    }
  },

  logout() {
    this.clearAuthData();
  },

  // Обновление данных пользователя в localStorage
  updateUserData(user: any) {
    const token = this.getToken();
    if (token && user) {
      // Обновляем данные пользователя в localStorage
      this.setAuthData(token, user);
    }
  },
  
  // Локальное обновление профиля без обращения к серверу (временное решение)
  localUpdateUserProfile(userData: { name?: string; email?: string; login?: string; password?: string }): User {
    try {
      console.log("Локальное обновление профиля пользователя");
      const token = this.getToken();
      const currentUser = this.getUser();
      
      if (!token || !currentUser) {
        throw new Error("Необходима авторизация для обновления профиля");
      }
      
      // Создаем обновленные данные пользователя, сохраняя все предыдущие поля
      const updatedUser = {
        ...currentUser,
        name: userData.name || currentUser.name,
        email: userData.email || currentUser.email,
        login: userData.login || currentUser.login,
        // Сохраняем оригинальный _id и другие важные поля
        _id: currentUser._id || currentUser.id,
        id: currentUser._id || currentUser.id,
      };
      
      console.log("Обновленные данные пользователя:", updatedUser);
      
      // Сохраняем в localStorage с тем же токеном
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      
      // Дополнительно сохраняем в постоянное хранилище под специальным ключом
      // Это поможет сохранить данные даже после перезагрузки
      try {
        localStorage.setItem("SAVED_USER_PROFILE", JSON.stringify(updatedUser));
        console.log("Профиль сохранен в постоянное хранилище");
      } catch (storageError) {
        console.warn("Не удалось сохранить профиль в постоянное хранилище:", storageError);
      }
      
      return updatedUser;
    } catch (error) {
      console.error("Ошибка при локальном обновлении профиля:", error);
      throw error as Error;
    }
  },
  
  // Загрузка сохраненного профиля из localStorage
  loadSavedProfile(): User | null {
    try {
      const savedProfileStr = localStorage.getItem("SAVED_USER_PROFILE");
      if (!savedProfileStr) return null;
      
      const savedProfile = JSON.parse(savedProfileStr);
      console.log("Загружен сохраненный профиль:", savedProfile);
      
      // Если есть действующий токен, обновляем текущего пользователя
      const token = this.getToken();
      if (token) {
        this.setAuthData(token, savedProfile);
        console.log("Профиль применен с текущим токеном");
      }
      
      return savedProfile;
    } catch (error) {
      console.error("Ошибка при загрузке сохраненного профиля:", error);
      return null;
    }
  }
};
