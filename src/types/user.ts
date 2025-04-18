export interface User {
  _id: string;
  name: string;
  email: string;
  login: string;
  role: "user" | "admin";
}

// Данные для создания пользователя
export interface UserCreateData {
  name: string;
  email: string;
  login: string;
  password: string;
  role: "user" | "admin";
}

// Данные для обновления пользователя
export interface UserUpdateData {
  name?: string;
  email?: string;
  login?: string;
  password?: string;
  role?: "user" | "admin";
}

// Ответ API при получении списка пользователей
export interface UsersResponse {
  users: User[];
}

// Ответ API при получении одного пользователя
export interface UserResponse {
  user: User;
}
