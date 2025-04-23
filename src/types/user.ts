/**
 * Базовый интерфейс пользователя с общими полями
 */
export interface BaseUser {
  name: string;
  email: string;
  login: string;
  role: "user" | "admin";
}

/**
 * Интерфейс пользователя, получаемый с сервера
 */
export interface User extends BaseUser {
  _id: string;
  id?: string; // Для совместимости с auth интерфейсом
}

/**
 * Данные для создания пользователя
 */
export interface UserCreateData extends BaseUser {
  password: string;
}

/**
 * Данные для обновления пользователя
 */
export interface UserUpdateData {
  name?: string;
  email?: string;
  login?: string;
  password?: string;
  role?: "user" | "admin";
}

/**
 * Ответ API при получении списка пользователей
 */
export interface UsersResponse {
  users: User[];
}

/**
 * Ответ API при получении одного пользователя
 */
export interface UserResponse {
  user: User;
}
