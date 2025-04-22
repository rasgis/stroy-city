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
  async (credentials: LoginCredentials, { dispatch, rejectWithValue }) => {
    try {
      // При входе получаем данные пользователя и загружаем его корзину
      const response = await authService.login(credentials);

      // Загружаем корзину из localStorage при входе
      dispatch(loadCart());
      return response.user; // Возвращаем пользователя из ответа
    } catch (error) {
      console.error("Ошибка в thunk login:", error);
      // Проверяем, имеет ли ошибка сообщение и возвращаем его для более информативного вывода
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Ошибка при входе");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (credentials: RegisterCredentials, { dispatch, rejectWithValue }) => {
    try {
      // При регистрации получаем данные пользователя и загружаем его корзину
      const user = await authService.register(credentials);

      // Загружаем корзину из localStorage при регистрации
      dispatch(loadCart());
      return user;
    } catch (error) {
      console.error("Ошибка в thunk register:", error);
      // Проверяем, имеет ли ошибка сообщение и возвращаем его для более информативного вывода
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Ошибка при регистрации");
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
    updateUserData: (state, action) => {
      // Если у нас уже есть пользователь, сохраняем его роль
      const currentUserRole = state.user?.role;

      // Обновляем данные пользователя
      state.user = action.payload;

      // Проверка безопасности: если роль в новых данных отличается от текущей,
      // и пользователь уже был авторизован, это может быть попытка повышения привилегий
      if (
        currentUserRole &&
        state.user &&
        state.isAuthenticated &&
        state.user.role !== currentUserRole
      ) {
        console.error(
          "КРИТИЧЕСКАЯ ОШИБКА БЕЗОПАСНОСТИ: Обнаружена попытка изменения роли пользователя",
          {
            previousRole: currentUserRole,
            attemptedNewRole: state.user.role,
          }
        );

        // Восстанавливаем правильную роль
        state.user.role = currentUserRole;
      }
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

        // Убедимся, что имя пользователя корректно обрабатывается
        if (action.payload) {
          state.user = {
            ...action.payload,
            name: action.payload.name || "", // Явно указываем имя пользователя
          };
        } else {
          state.user = action.payload;
        }

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

export const { clearError, updateUserData } = authSlice.actions;

export default authSlice.reducer;
