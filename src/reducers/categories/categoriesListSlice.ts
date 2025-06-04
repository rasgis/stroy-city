import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Category } from "../../types/category";
import { categoryService } from "../../services/categoryService";
import { RootState } from "../../store";
import { createSelector } from "reselect";

interface CategoriesListState {
  items: Category[];
  loading: boolean;
  error: string | null;
  filters: {
    searchTerm: string;
    isActive: boolean | null;
    showInactive: boolean;
  };
}

const initialState: CategoriesListState = {
  items: [],
  loading: false,
  error: null,
  filters: {
    searchTerm: "",
    isActive: null,
    showInactive: true,
  },
};

export const fetchCategories = createAsyncThunk(
  "categoriesList/fetchCategories",
  async () => {
    const categories = await categoryService.getCategories();
    return categories;
  }
);

export const deleteCategory = createAsyncThunk(
  "categoriesList/deleteCategory",
  async (id: string) => {
    await categoryService.deleteCategory(id);
    return id;
  }
);

export const hideCategory = createAsyncThunk(
  "categoriesList/hideCategory",
  async (id: string) => {
    await categoryService.hideCategory(id);
    return id;
  }
);

export const restoreCategory = createAsyncThunk(
  "categoriesList/restoreCategory",
  async (id: string) => {
    const restoredCategory = await categoryService.restoreCategory(id);
    return restoredCategory;
  }
);

const categoriesListSlice = createSlice({
  name: "categoriesList",
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<CategoriesListState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    addCategory: (state, action: PayloadAction<Category>) => {
      state.items.push(action.payload);
    },
    updateCategoryInList: (state, action: PayloadAction<Category>) => {
      const index = state.items.findIndex(
        (item) => item._id === action.payload._id
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Не удалось загрузить категории";
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addCase(hideCategory.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item._id === action.payload
        );
        if (index !== -1) {
          state.items[index].isActive = false;
        }
      })
      .addCase(restoreCategory.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

const selectCategoriesList = (state: RootState) => state.categoriesList.items;
const selectCategoriesListLoading = (state: RootState) =>
  state.categoriesList.loading;
const selectCategoriesListError = (state: RootState) =>
  state.categoriesList.error;
const selectCategoriesFilters = (state: RootState) =>
  state.categoriesList.filters;

export const selectFilteredCategories = createSelector(
  [selectCategoriesList, selectCategoriesFilters],
  (categories, filters) => {
    return categories.filter((category) => {
      
      if (
        filters.searchTerm &&
        !category.name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !category.description?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      ) {
        return false;
      }

      if (!filters.showInactive && !category.isActive) {
        return false;
      }

      return true;
    });
  }
);

export const selectCategoryById = createSelector(
  [selectCategoriesList, (_, categoryId: string) => categoryId],
  (categories, categoryId) =>
    categories.find((category) => category._id === categoryId) || null
);

export const selectActiveCategoriesForDropdown = createSelector(
  [selectCategoriesList],
  (categories) =>
    categories
      .filter((category) => category.isActive)
      .map((category) => ({
        value: category._id,
        label: category.name,
      }))
);

export const selectAllCategories = createSelector(
  [selectCategoriesList],
  (categories) => categories
);

export const { setFilters, resetFilters, addCategory, updateCategoryInList } =
  categoriesListSlice.actions;
export default categoriesListSlice.reducer;
