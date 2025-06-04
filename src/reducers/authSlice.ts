import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { LoginCredentials, RegisterCredentials } from "../types/auth";
import { User } from "../types/user";
import { authService } from "../services/authService";
import { loadCart } from "./cartSlice";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: authService.getUser(),
  isAuthenticated: authService.isAuthenticated(),
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { dispatch, rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);

      dispatch(loadCart());
      return response.user;
    } catch (error) {
      console.error("Ошибка в thunk login:", error);
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
      const user = await authService.register(credentials);

      dispatch(loadCart());
      return user;
    } catch (error) {
      console.error("Ошибка в thunk register:", error);

      if (error instanceof Error) {
        const errorMessage = error.message;

        if (errorMessage.includes("email уже существует")) {
          return rejectWithValue(
            "Пользователь с таким email уже зарегистрирован. Используйте другой email или войдите в систему."
          );
        }

        if (errorMessage.includes("логином уже существует")) {
          return rejectWithValue(
            "Пользователь с таким логином уже зарегистрирован. Пожалуйста, выберите другой логин."
          );
        }

        if (errorMessage.includes("заполните все поля")) {
          return rejectWithValue(
            "Пожалуйста, заполните все обязательные поля."
          );
        }

        return rejectWithValue(errorMessage);
      }

      return rejectWithValue(
        "Произошла ошибка при регистрации. Пожалуйста, попробуйте еще раз."
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    await authService.logout();
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
      const currentUserRole = state.user?.role;
      const currentUserName = state.user?.name || "";

      if (state.user && action.payload) {
        const newName = action.payload.name;
        const validName =
          newName && newName !== "Профиль" ? newName : currentUserName;

        state.user = {
          ...action.payload,
          name: validName,
          role: action.payload.role || currentUserRole,
        };

        if (
          currentUserRole &&
          state.isAuthenticated &&
          action.payload.role &&
          action.payload.role !== currentUserRole &&
          state.user
        ) {
          console.error(
            "КРИТИЧЕСКАЯ ОШИБКА БЕЗОПАСНОСТИ: Обнаружена попытка изменения роли пользователя",
            {
              previousRole: currentUserRole,
              attemptedNewRole: action.payload.role,
            }
          );

          state.user.role = currentUserRole;
        }
      } else {
        state.user = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload) {
          state.user = {
            ...action.payload,
            name: action.payload.name || "", 
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
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, updateUserData } = authSlice.actions;

export default authSlice.reducer;
