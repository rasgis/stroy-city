import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { CartItem } from "../types";
import { authService } from "../services/authService";
import { showNotification } from "./notificationsSlice";
import { AppDispatch } from "../store";

interface CartState {
  items: CartItem[];
  total: number;
}

const getCartStorageKey = (): string => {
  if (!authService.isAuthenticated()) {
    return "cart_guest";
  }

  const user = authService.getUser();
  if (user && user.id) {
    return `cart_${user.id}`;
  }

  return "cart_guest";
};

export const loadCartFromStorage = (): CartState => {
  try {
    const storageKey = getCartStorageKey();
    const cartData = localStorage.getItem(storageKey);

    if (cartData) {
      return JSON.parse(cartData);
    }
  } catch (error) {
    console.error("Ошибка при загрузке корзины из localStorage:", error);
  }
  return { items: [], total: 0 };
};

const saveCartToStorage = (cart: CartState) => {
  try {
    const key = getCartStorageKey();
    const user = authService.getUser();
    if (user && user.id) {
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
      state.items = [];
      state.total = 0;

      const key = getCartStorageKey();
      localStorage.removeItem(key);
    },
    loadCart: (state) => {

      const cart = loadCartFromStorage();

      state.items = cart.items;
      state.total = cart.total;
    },
  },
});

export const addToCartWithNotification =
  (item: CartItem) => (dispatch: AppDispatch) => {
    dispatch(addToCart(item));

    dispatch(
      showNotification({
        message: "Товар добавлен в корзину",
        type: "success",
      })
    );
  };

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  loadCart,
} = cartSlice.actions;

export default cartSlice.reducer;
