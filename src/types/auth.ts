import { BaseUser, User } from "./user";

export interface AuthUser extends BaseUser {
  id: string;
  _id?: string;
  password?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  login: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
