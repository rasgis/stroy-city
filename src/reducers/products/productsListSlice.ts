import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "../../types/product";
import { productService } from "../../services/productService";
import { RootState } from "../../store";
import { createSelector } from "reselect";

interface ProductsListState {
  items: Product[];
  adminItems: Product[]; 
  loading: boolean;
  error: string | null;
  filters: {
    category: string | null;
    searchTerm: string;
    minPrice: number | null;
    maxPrice: number | null;
    showInactive: boolean; 
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
  async (id: string, { rejectWithValue }) => {
    try {
      await productService.deleteProduct(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
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
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await productService.restoreProduct(id);
      
      if (!response._id) {
        const product = await productService.getProductById(id);
        return product;
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
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
      .addCase(deleteProduct.fulfilled, (state, action) => {
        
        state.items = state.items.filter((item) => item._id !== action.payload);

        const adminIndex = state.adminItems.findIndex(
          (item) => item._id === action.payload
        );
        
        if (adminIndex !== -1) {
          state.adminItems[adminIndex].isActive = false;
        } else {
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = "Ошибка при скрытии товара";
      })
      .addCase(permanentDeleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
        state.adminItems = state.adminItems.filter(
          (item) => item._id !== action.payload
        );
      })
      .addCase(restoreProduct.fulfilled, (state, action) => {
        
        const exists = state.items.some(
          (item) => item._id === action.payload._id
        );
        
        if (!exists) {
          state.items.push(action.payload);
        } else {
        }

        const adminIndex = state.adminItems.findIndex(
          (item) => item._id === action.payload._id
        );
        
        if (adminIndex !== -1) {
          state.adminItems[adminIndex] = {...state.adminItems[adminIndex], ...action.payload, isActive: true};
        } else {
          state.adminItems.push(action.payload);
        }
      })
      .addCase(restoreProduct.rejected, (state, action) => {
        state.error = "Ошибка при восстановлении товара";
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
      if (filters.category && product.category !== filters.category) {
        return false;
      }

      if (
        filters.searchTerm &&
        !product.name?.toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) &&
        !product.description?.toLowerCase()
          .includes(filters.searchTerm.toLowerCase())
      ) {
        return false;
      }

      if (filters.minPrice !== null && product.price < filters.minPrice) {
        return false;
      }

      if (filters.maxPrice !== null && product.price > filters.maxPrice) {
        return false;
      }

      return true;
    });
  }
);

export const selectFilteredAdminProducts = createSelector(
  [selectAdminProductsList, selectProductsFilters],
  (products, filters) => {
    return products.filter((product) => {
      if (!filters.showInactive && !product.isActive) {
        return false;
      }

      if (filters.category && product.category !== filters.category) {
        return false;
      }

      if (
        filters.searchTerm &&
        !product.name?.toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) &&
        !product.description?.toLowerCase()
          .includes(filters.searchTerm.toLowerCase())
      ) {
        return false;
      }

      if (filters.minPrice !== null && product.price < filters.minPrice) {
        return false;
      }

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
