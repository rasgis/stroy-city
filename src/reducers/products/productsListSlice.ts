import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "../../types/product";
import { productService } from "../../services/productService";
import { RootState } from "../../store";
import { createSelector } from "reselect";

interface ProductsListState {
  items: Product[];
  adminItems: Product[]; // Все товары (включая неактивные) для админа
  loading: boolean;
  error: string | null;
  filters: {
    category: string | null;
    searchTerm: string;
    minPrice: number | null;
    maxPrice: number | null;
    showInactive: boolean; // Показывать неактивные товары в админке
  };
}

const initialState: ProductsListState = {
  items: [],
  adminItems: [],
  loading: false,
  error: null,
  filters: {
    category: null,
    searchTerm: "",
    minPrice: null,
    maxPrice: null,
    showInactive: true,
  },
};

export const fetchProducts = createAsyncThunk(
  "productsList/fetchProducts",
  async () => {
    const products = await productService.getProducts();
    return products;
  }
);

export const fetchAllProductsAdmin = createAsyncThunk(
  "productsList/fetchAllProductsAdmin",
  async () => {
    const products = await productService.getAllProductsAdmin();
    return products;
  }
);

export const deleteProduct = createAsyncThunk(
  "productsList/deleteProduct",
  async (id: string) => {
    await productService.deleteProduct(id);
    return id;
  }
);

export const permanentDeleteProduct = createAsyncThunk(
  "productsList/permanentDeleteProduct",
  async (id: string) => {
    await productService.permanentDeleteProduct(id);
    return id;
  }
);

export const restoreProduct = createAsyncThunk(
  "productsList/restoreProduct",
  async (id: string) => {
    const restoredProduct = await productService.restoreProduct(id);
    return restoredProduct;
  }
);

const productsListSlice = createSlice({
  name: "productsList",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<ProductsListState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.items.push(action.payload);
      state.adminItems.push(action.payload);
    },
    updateProductInList: (state, action: PayloadAction<Product>) => {
      const index = state.items.findIndex(
        (item) => item._id === action.payload._id
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }

      const adminIndex = state.adminItems.findIndex(
        (item) => item._id === action.payload._id
      );
      if (adminIndex !== -1) {
        state.adminItems[adminIndex] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Не удалось загрузить продукты";
      })
      // Fetch All Products Admin
      .addCase(fetchAllProductsAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProductsAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.adminItems = action.payload;
      })
      .addCase(fetchAllProductsAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Не удалось загрузить продукты";
      })
      // Delete Product (soft delete)
      .addCase(deleteProduct.fulfilled, (state, action) => {
        // Удаляем из основного списка (обычные пользователи не видят неактивные товары)
        state.items = state.items.filter((item) => item._id !== action.payload);

        // Обновляем флаг активности в списке админа
        const adminIndex = state.adminItems.findIndex(
          (item) => item._id === action.payload
        );
        if (adminIndex !== -1) {
          state.adminItems[adminIndex].isActive = false;
        }
      })
      // Permanent Delete Product
      .addCase(permanentDeleteProduct.fulfilled, (state, action) => {
        // Удаляем из обоих списков
        state.items = state.items.filter((item) => item._id !== action.payload);
        state.adminItems = state.adminItems.filter(
          (item) => item._id !== action.payload
        );
      })
      // Restore Product
      .addCase(restoreProduct.fulfilled, (state, action) => {
        // Добавляем в обычный список
        const exists = state.items.some(
          (item) => item._id === action.payload._id
        );
        if (!exists) {
          state.items.push(action.payload);
        }

        // Обновляем в админском списке
        const adminIndex = state.adminItems.findIndex(
          (item) => item._id === action.payload._id
        );
        if (adminIndex !== -1) {
          state.adminItems[adminIndex] = action.payload;
        }
      });
  },
});

// Базовые селекторы
const selectProductsList = (state: RootState) => state.productsList.items;
const selectAdminProductsList = (state: RootState) =>
  state.productsList.adminItems;
const selectProductsListLoading = (state: RootState) =>
  state.productsList.loading;
const selectProductsListError = (state: RootState) => state.productsList.error;
const selectProductsFilters = (state: RootState) => state.productsList.filters;

// Мемоизированные селекторы
export const selectFilteredProducts = createSelector(
  [selectProductsList, selectProductsFilters],
  (products, filters) => {
    return products.filter((product) => {
      // Фильтрация по категории
      if (filters.category && product.category !== filters.category) {
        return false;
      }

      // Фильтрация по поисковому запросу
      if (
        filters.searchTerm &&
        !product.name
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) &&
        !product.description
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Фильтрация по цене (минимальная)
      if (filters.minPrice !== null && product.price < filters.minPrice) {
        return false;
      }

      // Фильтрация по цене (максимальная)
      if (filters.maxPrice !== null && product.price > filters.maxPrice) {
        return false;
      }

      return true;
    });
  }
);

// Селектор для административной панели со всеми товарами
export const selectFilteredAdminProducts = createSelector(
  [selectAdminProductsList, selectProductsFilters],
  (products, filters) => {
    return products.filter((product) => {
      // Фильтрация по активности (показывать/скрывать неактивные)
      if (!filters.showInactive && !product.isActive) {
        return false;
      }

      // Фильтрация по категории
      if (filters.category && product.category !== filters.category) {
        return false;
      }

      // Фильтрация по поисковому запросу
      if (
        filters.searchTerm &&
        !product.name
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) &&
        !product.description
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Фильтрация по цене (минимальная)
      if (filters.minPrice !== null && product.price < filters.minPrice) {
        return false;
      }

      // Фильтрация по цене (максимальная)
      if (filters.maxPrice !== null && product.price > filters.maxPrice) {
        return false;
      }

      return true;
    });
  }
);

export const selectProductById = createSelector(
  [selectProductsList, (_, productId: string) => productId],
  (products, productId) =>
    products.find((product) => product._id === productId) || null
);

export const selectAdminProductById = createSelector(
  [selectAdminProductsList, (_, productId: string) => productId],
  (products, productId) =>
    products.find((product) => product._id === productId) || null
);

export const { setFilters, resetFilters, addProduct, updateProductInList } =
  productsListSlice.actions;
export default productsListSlice.reducer;
