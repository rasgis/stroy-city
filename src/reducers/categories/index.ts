import categoriesListReducer from './categoriesListSlice';
import categoryDetailsReducer from './categoryDetailsSlice';

export { categoriesListReducer, categoryDetailsReducer };

// Re-export actions and selectors for convenience
export * from './categoriesListSlice';
export * from './categoryDetailsSlice'; 