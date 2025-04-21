import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { CartItem } from "../types";
import { authService } from "../services/authService";
import { showNotification } from "./notificationsSlice";
import { AppDispatch } from "../store";

interface CartState {
  items: CartItem[];
  total: number;
}

// Функция для получения ключа корзины в localStorage
const getCartStorageKey = (): string => {
  const user = authService.getUser();

  // Используем только id пользователя для формирования ключа
  if (user && user.id) {
    const key = `cart_${user.id}`;
    return key;
  }

  return "cart_guest";
};

// Функция для загрузки корзины из localStorage
export const loadCartFromStorage = (): CartState => {
  try {
    const cartData = localStorage.getItem(getCartStorageKey());
    if (cartData) {
      return JSON.parse(cartData);
    }
  } catch (error) {
    console.error("Ошибка при загрузке корзины из localStorage:", error);
  }
  return { items: [], total: 0 };
};

// Функция для сохранения корзины в localStorage
const saveCartToStorage = (cart: CartState) => {
  try {
    const key = getCartStorageKey();
    // Очищаем устаревшие ключи для текущего пользователя
    const user = authService.getUser();
    if (user && user.id) {
      // Удаляем старые ключи, если они существуют
      const oldKeys = [`cart_${user._id}`];
      oldKeys.forEach((oldKey) => {
        if (oldKey !== key && localStorage.getItem(oldKey)) {
          localStorage.removeItem(oldKey);
        }
      });
    }

    localStorage.setItem(key, JSON.stringify(cart));
  } catch (error) {
    console.error("Ошибка при сохранении корзины в localStorage:", error);
  }
};

const initialState: CartState = loadCartFromStorage();

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item._id === action.payload._id
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.total = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      saveCartToStorage(state);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
      state.total = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      saveCartToStorage(state);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ _id: string; quantity: number }>
    ) => {
      const item = state.items.find((item) => item._id === action.payload._id);
      if (item) {
        item.quantity = action.payload.quantity;
        state.total = state.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      }
      saveCartToStorage(state);
    },
    clearCart: (state) => {
      // Очищаем корзину в состоянии
      state.items = [];
      state.total = 0;

      // Очищаем корзину в localStorage
      const key = getCartStorageKey();
      localStorage.removeItem(key);
    },
    loadCart: (state) => {
      // Загружаем корзину из localStorage с текущим ключом
      const cart = loadCartFromStorage();

      // Используем данные из текущей корзины
      state.items = cart.items;
      state.total = cart.total;
    },
  },
});

export const addToCartWithNotification = (item: CartItem) => (dispatch: AppDispatch) => {
  // Добавляем товар в корзину
  dispatch(addToCart(item));
  
  // Показываем уведомление
  dispatch(showNotification({
    message: "Товар добавлен в корзину",
    type: "success"
  }));
};

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  loadCart,
} = cartSlice.actions;

export default cartSlice.reducer;
