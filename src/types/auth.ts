export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  login: string;
  password: string;
  role: "admin" | "user";
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
