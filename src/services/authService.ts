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
    };

    console.log("Сохраняем данные пользователя:", normalizedUser);
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
        credentials
      );

      console.log("Ответ от сервера при входе:", response.data);

      // Сохраняем данные пользователя, включая _id или id
      const user = response.data.user;
      const userToSave = {
        ...user,
        id: user._id || user.id, // Сохраняем _id или id
      };

      // Используем метод setAuthData для унификации сохранения данных
      this.setAuthData(response.data.token, userToSave);

      return response.data;
    } catch (error) {
      console.error("Ошибка входа:", error);
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

      console.log("Отправка данных регистрации:", userData);

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`,
        userData,
        {
          headers: API_CONFIG.HEADERS,
        }
      );

      console.log("Ответ от сервера при регистрации:", response.data);

      const { token, ...user } = response.data;

      // Сохраняем данные пользователя, включая _id или id
      const userToSave = {
        ...user,
        id: user._id || user.id, // Сохраняем _id или id
      };

      // Сохраняем данные авторизации
      this.setAuthData(token, userToSave);

      return userToSave;
    } catch (error) {
      console.error("Ошибка при регистрации:", error);
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
};
