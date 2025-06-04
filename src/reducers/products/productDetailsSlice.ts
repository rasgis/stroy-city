import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Product, ProductFormData } from "../../types/product";
import { productService } from "../../services/productService";
import { RootState } from "../../store";
import { createSelector } from "reselect";

interface ProductDetailsState {
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
  saveStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: ProductDetailsState = {
  selectedProduct: null,
  loading: false,
  error: null,
  saveStatus: 'idle',
};

export const fetchProductById = createAsyncThunk(
  "productDetails/fetchById",
  async (id: string) => {
    const product = await productService.getProductById(id);
    return product;
  }
);

export const createProduct = createAsyncThunk(
  "productDetails/create",
  async (product: ProductFormData, { dispatch }) => {
    const newProduct = await productService.createProduct(product);
    dispatch({ type: 'productsList/addProduct', payload: newProduct });
    return newProduct;
  }
);

export const updateProduct = createAsyncThunk(
  "productDetails/update",
  async ({ id, product }: { id: string; product: ProductFormData }, { dispatch }) => {
    const updatedProduct = await productService.updateProduct(id, product);
    dispatch({ type: 'productsList/updateProductInList', payload: updatedProduct });
    return updatedProduct;
  }
);

const productDetailsSlice = createSlice({
  name: "productDetails",
  initialState,
  reducers: {
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    resetProductDetails: (state) => {
      state.selectedProduct = null;
      state.error = null;
      state.saveStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Не удалось загрузить продукт";
      })
      .addCase(createProduct.pending, (state) => {
        state.saveStatus = 'loading';
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        state.selectedProduct = action.payload;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.error = action.error.message || "Не удалось создать продукт";
      })
      .addCase(updateProduct.pending, (state) => {
        state.saveStatus = 'loading';
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        state.selectedProduct = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.error = action.error.message || "Не удалось обновить продукт";
      });
  },
});

const selectProductDetails = (state: RootState) => state.productDetails;

export const selectSelectedProduct = createSelector(
  [selectProductDetails],
  (details) => details.selectedProduct
);

export const selectProductLoading = createSelector(
  [selectProductDetails],
  (details) => details.loading
);

export const selectProductError = createSelector(
  [selectProductDetails],
  (details) => details.error
);

export const selectProductSaveStatus = createSelector(
  [selectProductDetails],
  (details) => details.saveStatus
);

export const { setSelectedProduct, resetProductDetails } = productDetailsSlice.actions;
export default productDetailsSlice.reducer; 