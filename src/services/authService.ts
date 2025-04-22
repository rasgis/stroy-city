import axios from "axios";
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
} from "../types/auth";
import { API_CONFIG } from "../config/api";
import { auditSecurityAction, clearAllAuthData } from "../utils/securityUtils";

const TOKEN_KEY = "token";
const USER_KEY = "user";
const ROLE_KEY = "role";

export const authService = {
  // Сохранение токена и данных пользователя
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
    localStorage.removeItem("SAVED_USER_PROFILE"); // Удаляем сохраненный профиль при выходе
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
          headers: API_CONFIG.HEADERS,
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
        role: user.role || "user",
      };

      // Используем метод setAuthData для унификации сохранения данных
      this.setAuthData(response.data.token, userToSave);

      return {
        ...response.data,
        user: userToSave, // Возвращаем обработанного пользователя
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
        role: user.role || "user",
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
    // Записываем информацию об операции в аудит безопасности
    auditSecurityAction("user-logout", {
      timestamp: new Date().toISOString(),
      success: true,
    });

    // Очищаем все данные аутентификации
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
  localUpdateUserProfile(userData: {
    name?: string;
    email?: string;
    login?: string;
    password?: string;
    role?: string;
  }): User {
    try {
      console.log("Локальное обновление профиля пользователя");
      const token = this.getToken();
      const currentUser = this.getUser();

      if (!token || !currentUser) {
        throw new Error("Необходима авторизация для обновления профиля");
      }

      // Проверяем попытку изменения роли - критическая уязвимость безопасности
      if (userData.role && userData.role !== currentUser.role) {
        console.error(
          "ВНИМАНИЕ: Попытка изменить роль пользователя локально!",
          {
            currentRole: currentUser.role,
            attemptedRole: userData.role,
          }
        );
        throw new Error("Изменение роли пользователя запрещено");
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
        // Явно сохраняем текущую роль пользователя
        role: currentUser.role,
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
        console.warn(
          "Не удалось сохранить профиль в постоянное хранилище:",
          storageError
        );
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

      // Получаем текущего пользователя и его роль
      const currentUser = this.getUser();
      const currentRole = currentUser?.role;

      let savedProfile = JSON.parse(savedProfileStr);
      console.log("Загружен сохраненный профиль:", savedProfile);

      // Проверка и защита: если роль в сохраненном профиле отличается от текущей роли пользователя
      if (
        currentUser &&
        savedProfile &&
        currentRole &&
        savedProfile.role !== currentRole
      ) {
        console.error(
          "КРИТИЧЕСКАЯ УЯЗВИМОСТЬ: Обнаружена попытка загрузки профиля с измененной ролью",
          {
            currentRole,
            savedProfileRole: savedProfile.role,
          }
        );

        // Принудительно устанавливаем правильную роль в загруженном профиле
        savedProfile.role = currentRole;

        // Обновляем SAVED_USER_PROFILE с правильной ролью
        localStorage.setItem(
          "SAVED_USER_PROFILE",
          JSON.stringify(savedProfile)
        );
        console.log(
          "Роль в сохраненном профиле принудительно исправлена на:",
          currentRole
        );
      }

      // Если есть действующий токен, обновляем текущего пользователя с защитой от изменения роли
      const token = this.getToken();
      if (token) {
        this.setAuthData(token, savedProfile);
        console.log("Профиль применен с текущим токеном");
      }

      return savedProfile;
    } catch (error) {
      console.error("Ошибка при загрузке сохраненного профиля:", error);

      // В случае ошибки чтения профиля - удаляем его из localStorage, чтобы предотвратить повторные ошибки
      localStorage.removeItem("SAVED_USER_PROFILE");

      return null;
    }
  },
};
