import productsListReducer from './productsListSlice';
import productDetailsReducer from './productDetailsSlice';

export { productsListReducer, productDetailsReducer };

// Re-export actions and selectors for convenience
export * from './productsListSlice';
export * from './productDetailsSlice'; 