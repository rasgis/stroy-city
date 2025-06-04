export interface BaseUser {
  name: string;
  email: string;
  login: string;
  role: "user" | "admin";
}

export interface User extends BaseUser {
  _id: string;
  id?: string; 
}

export interface UserCreateData extends BaseUser {
  password: string;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  login?: string;
  password?: string;
  role?: "user" | "admin";
}

export interface UsersResponse {
  users: User[];
}

export interface UserResponse {
  user: User;
}
