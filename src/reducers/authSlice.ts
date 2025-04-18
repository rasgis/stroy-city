import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { User, LoginCredentials, RegisterCredentials } from "../types/auth";
import { authService } from "../services/authService";
import { loadCart, clearCart } from "./cartSlice";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: authService.getUser(), // Восстанавливаем пользователя из localStorage
  isAuthenticated: authService.isAuthenticated(),
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { dispatch }) => {
    try {
      // При входе получаем данные пользователя и загружаем его корзину
      const response = await authService.login(credentials);
      // Загружаем корзину из localStorage при входе
      dispatch(loadCart());
      return response.user; // Возвращаем пользователя из ответа
    } catch (error) {
      console.error("Ошибка в thunk login:", error);
      throw error;
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (credentials: RegisterCredentials, { dispatch }) => {
    try {
      // При регистрации получаем данные пользователя и загружаем его корзину
      const user = await authService.register(credentials);
      // Загружаем корзину из localStorage при регистрации
      dispatch(loadCart());
      return user;
    } catch (error) {
      console.error("Ошибка в thunk register:", error);
      throw error;
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    await authService.logout();
    // Загружаем корзину гостя
    dispatch(loadCart());
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Ошибка при входе";
        state.isAuthenticated = false;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Ошибка при регистрации";
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;
