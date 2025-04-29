import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Category, CategoryFormData } from "../../types/category";
import { categoryService } from "../../services/categoryService";
import { RootState } from "../../store";
import { createSelector } from "reselect";

interface CategoryDetailsState {
  selectedCategory: Category | null;
  loading: boolean;
  error: string | null;
  saveStatus: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: CategoryDetailsState = {
  selectedCategory: null,
  loading: false,
  error: null,
  saveStatus: "idle",
};

export const fetchCategoryById = createAsyncThunk(
  "categoryDetails/fetchById",
  async (id: string) => {
    const category = await categoryService.getCategoryById(id);
    return category;
  }
);

export const createCategory = createAsyncThunk(
  "categoryDetails/create",
  async (category: CategoryFormData, { dispatch }) => {
    const newCategory = await categoryService.createCategory(category);
    // Заполняем список категорий в другом слайсе
    dispatch({ type: "categoriesList/addCategory", payload: newCategory });
    return newCategory;
  }
);

export const updateCategory = createAsyncThunk(
  "categoryDetails/update",
  async (
    { id, category }: { id: string; category: CategoryFormData },
    { dispatch }
  ) => {
    const updatedCategory = await categoryService.updateCategory(id, category);
    // Обновляем в списке категорий
    dispatch({
      type: "categoriesList/updateCategoryInList",
      payload: updatedCategory,
    });
    return updatedCategory;
  }
);

const categoryDetailsSlice = createSlice({
  name: "categoryDetails",
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload;
    },
    resetCategoryDetails: (state) => {
      state.selectedCategory = null;
      state.error = null;
      state.saveStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Category by ID
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Не удалось загрузить категорию";
      })
      // Create Category
      .addCase(createCategory.pending, (state) => {
        state.saveStatus = "loading";
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.selectedCategory = action.payload;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.error = action.error.message || "Не удалось создать категорию";
      })
      // Update Category
      .addCase(updateCategory.pending, (state) => {
        state.saveStatus = "loading";
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.saveStatus = "succeeded";
        state.selectedCategory = action.payload;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.saveStatus = "failed";
        state.error = action.error.message || "Не удалось обновить категорию";
      });
  },
});

// Базовые селекторы
const selectCategoryDetails = (state: RootState) => state.categoryDetails;

// Мемоизированные селекторы
export const selectSelectedCategory = createSelector(
  [selectCategoryDetails],
  (details) => details.selectedCategory
);

export const selectCategoryLoading = createSelector(
  [selectCategoryDetails],
  (details) => details.loading
);

export const selectCategoryError = createSelector(
  [selectCategoryDetails],
  (details) => details.error
);

export const selectCategorySaveStatus = createSelector(
  [selectCategoryDetails],
  (details) => details.saveStatus
);

export const { setSelectedCategory, resetCategoryDetails } =
  categoryDetailsSlice.actions;
export default categoryDetailsSlice.reducer;
