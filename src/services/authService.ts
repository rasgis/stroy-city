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

  getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

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

  isAuthenticated(): boolean {
    return !!this.getToken() && this.isTokenValid();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      const user = response.user;

      const userToSave = {
        ...user,
        id: user._id || user.id || "", 
        name: user.name || "",
        email: user.email || "",
        login: user.login || "",
        role: user.role || "user",
      };

      this.setAuthData(response.token, userToSave);

      return {
        ...response,
        user: userToSave, 
      };
    } catch (error) {
      console.error("Ошибка входа:", error);
      throw error;
    }
  }

  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      const userData = {
        name: credentials.name,
        email: credentials.email,
        login: credentials.login,
        password: credentials.password,
        role: "user",
      };

      const response = await this.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        userData
      );

      if (!response || !response.token) {
        throw new Error("Неверный формат ответа от сервера");
      }

      const { token, user } = response;

      const userToSave = {
        ...user,
        id: user._id || user.id || "", 
        name: user.name || credentials.name || "",
        email: user.email || credentials.email || "",
        login: user.login || credentials.login || "",
        role: user.role || "user",
      };

      this.setAuthData(token, userToSave);

      return userToSave;
    } catch (error) {
      if (error instanceof Error) {
        const message = error.message;

        if (message.includes("email уже существует")) {
          throw new Error(
            "Пользователь с таким email уже зарегистрирован. Пожалуйста, используйте другой email или выполните вход."
          );
        }

        if (message.includes("логином уже существует")) {
          throw new Error(
            "Пользователь с таким логином уже зарегистрирован. Пожалуйста, выберите другой логин."
          );
        }

        if (message.includes("заполните все поля")) {
          throw new Error(
            "Пожалуйста, заполните все обязательные поля для регистрации."
          );
        }

        if (message.includes("пароль") && message.includes("символов")) {
          throw new Error(
            "Пароль должен содержать как минимум 6 символов, включая буквы и цифры."
          );
        }
      }

      throw error;
    }
  }

  async getUserProfile(): Promise<User> {
    return this.get<User>(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
  }

  logout() {
    auditSecurityAction("user-logout", {
      timestamp: new Date().toISOString(),
      success: true,
    });

    this.clearAuthData();
  }

  updateUserData(user: any) {
    const currentUser = this.getUser();
    const currentRole = currentUser?.role;
    const token = this.getToken();

    if (!token || !currentUser) {
      console.error("Невозможно обновить данные: пользователь не авторизован");
      return;
    }

    const updatedUser = {
      ...currentUser,
      ...user,
      role: user.role || currentRole,
    };

    this.setAuthData(token, updatedUser);
  }

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

    const updatedUser = {
      ...currentUser,
      ...validUserData,
      role: currentUser.role, 
    };


    this.setAuthData(token, updatedUser);

    return updatedUser;
  }

  loadSavedProfile(): User | null {
    const savedProfileStr = localStorage.getItem(SAVED_PROFILE_KEY);
    return savedProfileStr ? JSON.parse(savedProfileStr) : null;
  }
}

export const authService = new AuthService();
