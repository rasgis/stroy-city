import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Category } from "../types/category";
import { categoryService } from "../services/categoryService";

export interface CategoryState {
  items: Category[];
  selectedCategory: Category | null;
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  items: [],
  selectedCategory: null,
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async () => {
    const categories = await categoryService.getCategories();
    return categories;
  }
);

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (
    category: Omit<Category, "_id" | "id" | "createdAt" | "updatedAt">
  ) => {
    const newCategory = await categoryService.createCategory(category);
    return newCategory;
  }
);

export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, category }: { id: string; category: Partial<Category> }) => {
    const updatedCategory = await categoryService.updateCategory(id, category);
    return updatedCategory;
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id: string) => {
    await categoryService.deleteCategory(id);
    return id;
  }
);

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
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
        state.error = action.error.message || "Failed to fetch categories";
      })
      // Create Category
      .addCase(createCategory.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Update Category
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete Category
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      });
  },
});

export const { setSelectedCategory } = categorySlice.actions;
export default categorySlice.reducer;
