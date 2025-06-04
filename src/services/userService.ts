import { API_CONFIG } from "../config/api";
import { User, UserCreateData, UserUpdateData } from "../types/user";
import { BaseService } from "./common/BaseService";

class UserService extends BaseService {
  private readonly endpoint = API_CONFIG.ENDPOINTS.USERS.BASE;

  async getAllUsers(): Promise<User[]> {
    return this.get<User[]>(this.endpoint);
  }

  async getUserById(id: string): Promise<User> {
    return this.get<User>(API_CONFIG.ENDPOINTS.USERS.BY_ID(id));
  }

  async createUser(userData: UserCreateData): Promise<User> {
    const validUserData = {
      ...userData,
      role: userData.role === "admin" ? "admin" : "user",
    };

    return this.post<User>(this.endpoint, validUserData);
  }

  async updateUser(id: string, userData: UserUpdateData): Promise<User> {
    return this.put<User>(API_CONFIG.ENDPOINTS.USERS.BY_ID(id), userData);
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>(
      API_CONFIG.ENDPOINTS.USERS.BY_ID(id)
    );
  }

  async updateUserProfile(userData: UserUpdateData): Promise<User> {
    if (userData.role) {
      console.error(
        "ПРЕДУПРЕЖДЕНИЕ: Попытка изменить роль через API профиля:",
        {
          userData,
        }
      );

      delete userData.role;
    }

    if (userData.login) {
      console.warn("Попытка изменить логин через API профиля - игнорируем");
      delete userData.login;
    }

    if (userData.email) {
      console.warn("Попытка изменить email через API профиля - игнорируем");
      delete userData.email;
    }

    const url = API_CONFIG.ENDPOINTS.AUTH.PROFILE;
    const response = await this.put<User>(url, userData);

    return response;
  }

  async deleteCurrentUser(): Promise<{ message: string }> {
    return this.delete<{ message: string }>(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
  }
}

export const userService = new UserService();
