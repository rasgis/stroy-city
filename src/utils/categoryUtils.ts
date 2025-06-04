import { Category } from "../types";

export const buildCategoryTree = (categories: Category[]): Category[] => {
  const categoryMap = new Map<string, Category>();
  const rootCategories: Category[] = [];

  categories.forEach((category) => {
    categoryMap.set(category._id, { ...category, children: [] });
  });

  categories.forEach((category) => {
    const currentCategory = categoryMap.get(category._id);
    if (currentCategory) {
      if (category.parentId) {
        const parentCategory = categoryMap.get(category.parentId);
        if (parentCategory) {
          if (!parentCategory.children) {
            parentCategory.children = [];
          }
          parentCategory.children.push(currentCategory);
        }
      } else {
        rootCategories.push(currentCategory);
      }
    }
  });

  return rootCategories;
};
