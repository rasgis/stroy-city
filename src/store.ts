import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./reducers/cartSlice";
import authReducer from "./reducers/authSlice";
import { productsListReducer, productDetailsReducer } from "./reducers/products";
import { categoriesListReducer, categoryDetailsReducer } from "./reducers/categories";

export interface RootState {
  productsList: ReturnType<typeof productsListReducer>;
  productDetails: ReturnType<typeof productDetailsReducer>;
  categoriesList: ReturnType<typeof categoriesListReducer>;
  categoryDetails: ReturnType<typeof categoryDetailsReducer>;
  cart: ReturnType<typeof cartReducer>;
  auth: ReturnType<typeof authReducer>;
}

export const store = configureStore({
  reducer: {
    productsList: productsListReducer,
    productDetails: productDetailsReducer,
    categoriesList: categoriesListReducer,
    categoryDetails: categoryDetailsReducer,
    cart: cartReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type AppDispatch = typeof store.dispatch;
