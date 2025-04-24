import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from "../types/auth";
import { User } from "../types/user";
import { API_CONFIG } from "../config/api";
import { auditSecurityAction } from "../utils/securityUtils";
import { BaseService } from "./common/BaseService";

const TOKEN_KEY = "token";
const USER_KEY = "user";
const ROLE_KEY = "role";

class AuthService extends BaseService {
  /**
   * Сохранение токена и данных пользователя
   * @param token Токен авторизации
   * @param user Данные пользователя
   */
  setAuthData(token: string, user: User | any) {
    // Проверка и нормализация ID пользователя
    // Получаем текущие данные пользователя для проверки безопасности
    const currentUserStr = localStorage.getItem(USER_KEY);
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
    const currentRole = currentUser?.role;

    let userProfile = { ...user };

    // Проверка безопасности: если пользователь пытается изменить роль
    if (currentUser && userProfile && currentRole) {
      // Если роль пытаются изменить или роль не указана - блокируем изменение
      if (userProfile.role !== currentRole) {
        console.warn("БЛОКИРОВАНА ПОПЫТКА ИЗМЕНЕНИЯ РОЛИ через setAuthData", {
          currentRole,
          attemptedRole: userProfile.role || "не указана",
          userId: userProfile.id || userProfile._id,
          timestamp: new Date().toISOString(),
        });

        // Принудительно восстанавливаем правильную роль
        userProfile.role = currentRole;
      }

      // Дополнительная проверка на подмену идентификатора
      if (
        currentUser.id &&
        userProfile.id &&
        currentUser.id !== userProfile.id
      ) {
        console.warn(
          "БЛОКИРОВАНА ПОПЫТКА ПОДМЕНЫ ИДЕНТИФИКАТОРА ПОЛЬЗОВАТЕЛЯ",
          {
            currentId: currentUser.id,
            attemptedId: userProfile.id,
            timestamp: new Date().toISOString(),
          }
        );

        // Сохраняем оригинальный идентификатор
        userProfile.id = currentUser.id;
        userProfile._id = currentUser.id;
      }
    }

    const normalizedUser = {
      ...userProfile,
      // Используем _id или id из ответа сервера
      id: userProfile._id || userProfile.id || "",
      // Гарантируем, что имя будет установлено
      name: userProfile.name || "",
    };

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));

    // Сохраняем роль пользователя, если она есть
    if (normalizedUser.role) {
      localStorage.setItem(ROLE_KEY, normalizedUser.role);
    }

    // Обновляем сохраненный профиль с безопасной ролью
    localStorage.setItem("SAVED_USER_PROFILE", JSON.stringify(normalizedUser));
  }

  /**
   * Получение токена
   * @returns Токен авторизации или null
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
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
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem("SAVED_USER_PROFILE"); // Удаляем сохраненный профиль при выходе
  }

  /**
   * Проверка авторизации
   * @returns true если пользователь авторизован
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
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
   * Обновление данных пользователя в localStorage
   * @param user Данные пользователя для обновления
   */
  updateUserData(user: any) {
    const token = this.getToken();
    if (token && user) {
      // Обновляем данные пользователя в localStorage
      this.setAuthData(token, user);
    }
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
    const savedProfileStr = localStorage.getItem("SAVED_USER_PROFILE");
    return savedProfileStr ? JSON.parse(savedProfileStr) : null;
  }
}

// Экспортируем экземпляр сервиса
export const authService = new AuthService();
