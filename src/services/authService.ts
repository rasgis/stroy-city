import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from "../types/auth";
import { User } from "../types/user";
import { API_CONFIG } from "../config/api";
import {
  auditSecurityAction,
  TOKEN_KEY,
  USER_KEY,
  ROLE_KEY,
  SAVED_PROFILE_KEY,
  TOKEN_EXPIRY_KEY,
} from "../utils/securityUtils";
import { BaseService } from "./common/BaseService";

class AuthService extends BaseService {

  setAuthData(token: string, user: User | any) {
    try {
      // Проверка и нормализация ID пользователя
      const currentUserStr = localStorage.getItem(USER_KEY);
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
      const currentRole = currentUser?.role;

      let userProfile = { ...user };

      const normalizedUser = {
        ...userProfile,
        id: userProfile._id || userProfile.id || "",
        name: userProfile.name || "",
        role: userProfile.role || currentRole || "user",
      };

      // Сохраняем токен и его срок действия (7 дней)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);
      
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryDate.toISOString());
      localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));

      if (normalizedUser.role) {
        localStorage.setItem(ROLE_KEY, normalizedUser.role);
      }

      localStorage.setItem(SAVED_PROFILE_KEY, JSON.stringify(normalizedUser));
    } catch (error) {
      console.error("Ошибка при сохранении данных авторизации:", error);
      this.clearAuthData();
      throw new Error("Не удалось сохранить данные авторизации");
    }
  }

  /**
   * Проверка срока действия токена
   * @returns boolean
   */
  isTokenValid(): boolean {
    try {
      const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
      if (!expiryStr) return false;

      const expiryDate = new Date(expiryStr);
      return expiryDate > new Date();
    } catch (error) {
      console.error("Ошибка при проверке срока действия токена:", error);
      return false;
    }
  }

  /**
   * Получение токена
   * @returns Токен авторизации или null
   */
  getToken(): string | null {
    try {
      if (!this.isTokenValid()) {
        this.clearAuthData();
        return null;
      }
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error("Ошибка при получении токена:", error);
      return null;
    }
  }

  /**
   * Получение данных пользователя
   * @returns Данные пользователя или null
   */
  getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Очистка данных авторизации
   */
  clearAuthData() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(ROLE_KEY);
      localStorage.removeItem(SAVED_PROFILE_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
    } catch (error) {
      console.error("Ошибка при очистке данных авторизации:", error);
    }
  }

  /**
   * Проверка авторизации
   * @returns true если пользователь авторизован
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && this.isTokenValid();
  }

  /**
   * Авторизация пользователя
   * @param credentials Учетные данные для входа
   * @returns Ответ авторизации с токеном и данными пользователя
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      // Сохраняем данные пользователя, включая _id или id
      const user = response.user;

      // Убедимся, что все поля пользователя корректно копируются
      const userToSave = {
        ...user,
        id: user._id || user.id || "", // Сохраняем _id или id
        name: user.name || "", // Явно указываем имя
        email: user.email || "",
        login: user.login || "",
        role: user.role || "user",
      };

      // Используем метод setAuthData для унификации сохранения данных
      this.setAuthData(response.token, userToSave);

      return {
        ...response,
        user: userToSave, // Возвращаем обработанного пользователя
      };
    } catch (error) {
      console.error("Ошибка входа:", error);
      throw error;
    }
  }

  /**
   * Регистрация нового пользователя
   * @param credentials Данные для регистрации
   * @returns Данные созданного пользователя
   */
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

      const response = await this.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        userData
      );

      // Проверяем, что response содержит все необходимые поля
      if (!response || !response.token) {
        throw new Error("Неверный формат ответа от сервера");
      }

      const { token, user } = response;

      // Сохраняем данные пользователя, включая _id или id
      const userToSave = {
        ...user,
        id: user._id || user.id || "", // Сохраняем _id или id
        name: user.name || credentials.name || "", // Используем имя из ответа или из отправленных данных
        email: user.email || credentials.email || "",
        login: user.login || credentials.login || "",
        role: user.role || "user",
      };

      // Сохраняем данные авторизации
      this.setAuthData(token, userToSave);

      return userToSave;
    } catch (error) {
      // Улучшенная обработка ошибок для удобного чтения пользователями
      if (error instanceof Error) {
        const message = error.message;

        // Проверка на существующий email
        if (message.includes("email уже существует")) {
          throw new Error(
            "Пользователь с таким email уже зарегистрирован. Пожалуйста, используйте другой email или выполните вход."
          );
        }

        // Проверка на существующий логин
        if (message.includes("логином уже существует")) {
          throw new Error(
            "Пользователь с таким логином уже зарегистрирован. Пожалуйста, выберите другой логин."
          );
        }

        // Другие типичные ошибки при регистрации
        if (message.includes("заполните все поля")) {
          throw new Error(
            "Пожалуйста, заполните все обязательные поля для регистрации."
          );
        }

        // Сложность пароля
        if (message.includes("пароль") && message.includes("символов")) {
          throw new Error(
            "Пароль должен содержать как минимум 6 символов, включая буквы и цифры."
          );
        }
      }

      // Если не смогли обработать ошибку более конкретно, пробрасываем исходную
      throw error;
    }
  }

  /**
   * Получение профиля пользователя
   * @returns Данные профиля пользователя
   */
  async getUserProfile(): Promise<User> {
    return this.get<User>(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
  }

  /**
   * Выход из системы
   */
  logout() {
    // Записываем информацию об операции в аудит безопасности
    auditSecurityAction("user-logout", {
      timestamp: new Date().toISOString(),
      success: true,
    });

    // Очищаем все данные аутентификации
    this.clearAuthData();
  }

  /**
   * Обновление хранимых данных пользователя без запроса к серверу
   * @param user Обновленные данные пользователя
   */
  updateUserData(user: any) {
    const currentUser = this.getUser();
    const currentRole = currentUser?.role;
    const token = this.getToken();

    if (!token || !currentUser) {
      console.error("Невозможно обновить данные: пользователь не авторизован");
      return;
    }

    // Объединяем данные, сохраняя роль
    const updatedUser = {
      ...currentUser,
      ...user,
      // Сохраняем текущую роль, если она не указана в обновленных данных
      role: user.role || currentRole,
    };

    // Обновляем данные через основной метод
    this.setAuthData(token, updatedUser);
  }

  /**
   * Локальное обновление профиля без обращения к серверу
   * @param userData Данные пользователя для обновления
   * @returns Обновленные данные пользователя
   */
  localUpdateUserProfile(userData: {
    name?: string;
    email?: string;
    login?: string;
    password?: string;
    role?: string;
  }): User | null {
    const currentUser = this.getUser();
    const token = this.getToken();

    if (!currentUser || !token) {
      console.error(
        "Невозможно обновить профиль - пользователь не авторизован"
      );
      return null;
    }

    // Защита от изменения роли
    const validUserData = { ...userData };
    if (validUserData.role && validUserData.role !== currentUser.role) {
      console.warn(
        "ПОПЫТКА ИЗМЕНЕНИЯ РОЛИ через localUpdateUserProfile ЗАБЛОКИРОВАНА",
        {
          currentRole: currentUser.role,
          attemptedRole: validUserData.role,
        }
      );
      validUserData.role = currentUser.role;
    }

    // Обновляем данные пользователя
    const updatedUser = {
      ...currentUser,
      ...validUserData,
      role: currentUser.role, // Гарантируем, что роль не изменится
    };

    // Сохраняем обновленные данные
    this.setAuthData(token, updatedUser);

    return updatedUser;
  }

  /**
   * Загрузка сохраненного профиля
   * @returns Сохраненный профиль пользователя или null
   */
  loadSavedProfile(): User | null {
    const savedProfileStr = localStorage.getItem(SAVED_PROFILE_KEY);
    return savedProfileStr ? JSON.parse(savedProfileStr) : null;
  }
}

// Экспортируем экземпляр сервиса
export const authService = new AuthService();
