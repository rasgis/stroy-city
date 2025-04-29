import categoriesListReducer, {
  fetchCategories,
  deleteCategory,
  selectFilteredCategories,
  selectAllCategories,
  setFilters,
  hideCategory,
  restoreCategory,
} from "./categoriesListSlice";
import categoryDetailsReducer, {
  fetchCategoryById,
  createCategory,
  updateCategory,
  selectSelectedCategory,
  selectCategoryLoading,
  selectCategoryError,
} from "./categoryDetailsSlice";

export {
  categoriesListReducer,
  categoryDetailsReducer,
  fetchCategories,
  fetchCategoryById,
  deleteCategory,
  createCategory,
  updateCategory,
  hideCategory,
  restoreCategory,
  selectFilteredCategories,
  selectSelectedCategory,
  selectAllCategories,
  selectCategoryLoading,
  selectCategoryError,
  setFilters,
};

// Re-export actions and selectors for convenience
export * from "./categoriesListSlice";
export * from "./categoryDetailsSlice";
