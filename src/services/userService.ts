import { API_CONFIG } from "../config/api";
import { User, UserCreateData, UserUpdateData } from "../types/user";
import { BaseService } from "./common/BaseService";

class UserService extends BaseService {
  private readonly endpoint = API_CONFIG.ENDPOINTS.USERS.BASE;

  // Получение всех пользователей
  async getAllUsers(): Promise<User[]> {
    return this.get<User[]>(this.endpoint);
  }

  // Получение пользователя по ID
  async getUserById(id: string): Promise<User> {
    return this.get<User>(API_CONFIG.ENDPOINTS.USERS.BY_ID(id));
  }

  // Создание нового пользователя (только для администраторов)
  async createUser(userData: UserCreateData): Promise<User> {
    // Проверяем, что роль валидная
    const validUserData = {
      ...userData,
      role: userData.role === "admin" ? "admin" : "user",
    };

    return this.post<User>(this.endpoint, validUserData);
  }

  // Обновление пользователя
  async updateUser(id: string, userData: UserUpdateData): Promise<User> {
    return this.put<User>(API_CONFIG.ENDPOINTS.USERS.BY_ID(id), userData);
  }

  // Удаление пользователя
  async deleteUser(id: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>(
      API_CONFIG.ENDPOINTS.USERS.BY_ID(id)
    );
  }

  // Обновление профиля текущего пользователя
  async updateUserProfile(userData: UserUpdateData): Promise<User> {
    // Проверяем попытку изменения роли - это критическая уязвимость безопасности
    if (userData.role) {
      console.error(
        "ПРЕДУПРЕЖДЕНИЕ: Попытка изменить роль через API профиля:",
        {
          userData,
        }
      );

      // Удаляем роль из данных перед отправкой на сервер
      delete userData.role;
    }

    // Обновлен маршрут после рефакторинга сервера от 2024-06-24
    // Используем /api/auth/profile вместо /api/users/profile
    const url = API_CONFIG.ENDPOINTS.AUTH.PROFILE;
    const response = await this.put<User>(url, userData);

    return response;
  }
}

export const userService = new UserService();
