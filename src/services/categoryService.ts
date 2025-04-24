import { Category, CategoryFormData } from "../types/category";
import { BaseService } from "./common/BaseService";
import { API_CONFIG } from "../config/api";

export interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

class CategoryService extends BaseService {
  private readonly endpoint = API_CONFIG.ENDPOINTS.CATEGORIES.BASE;

  async getCategories(): Promise<Category[]> {
    return this.get<Category[]>(this.endpoint);
  }

  async getCategoryById(id: string): Promise<Category> {
    return this.get<Category>(`${this.endpoint}/${id}`);
  }

  async createCategory(categoryData: CategoryFormData): Promise<Category> {
    const data = {
      name: categoryData.name,
      description: categoryData.description,
      parentId: categoryData.parentId,
      isActive: categoryData.isActive,
      image: categoryData.image,
    };

    return this.post<Category>(this.endpoint, data);
  }

  async updateCategory(
    id: string,
    categoryData: CategoryFormData
  ): Promise<Category> {
    const data = {
      name: categoryData.name,
      description: categoryData.description,
      parentId: categoryData.parentId,
      isActive: categoryData.isActive,
      image: categoryData.image,
    };

    return this.put<Category>(`${this.endpoint}/${id}`, data);
  }

  async deleteCategory(id: string): Promise<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }

  buildCategoryTree(categories: Category[]): Category[] {
    return categories.filter((category) => !category.parentId);
  }

  // Построить полное дерево категорий с вложенными подкатегориями
  buildFullCategoryTree(
    categories: Category[],
    parentId?: string
  ): CategoryWithChildren[] {
    return categories
      .filter((category) => category.parentId === parentId)
      .map((category) => ({
        ...category,
        children: this.buildFullCategoryTree(categories, category._id),
      }));
  }

  // Получить все категории и подкатегории в плоском списке, подходит для select-опций
  getAllCategoriesFlat(categories: Category[]): {
    id: string;
    name: string;
    level: number;
    isParent: boolean;
  }[] {
    // Строим дерево категорий
    const categoryTree = this.buildFullCategoryTree(categories);

    // Рекурсивно проходим по дереву и создаем плоский список
    const flattenCategories = (
      categoryList: CategoryWithChildren[],
      level = 0,
      result: {
        id: string;
        name: string;
        level: number;
        isParent: boolean;
      }[] = []
    ) => {
      categoryList.forEach((category) => {
        const hasChildren = !!(
          category.children && category.children.length > 0
        );

        // Добавляем текущую категорию
        result.push({
          id: category._id,
          name: category.name,
          level,
          isParent: hasChildren,
        });

        // Если есть подкатегории, рекурсивно добавляем их
        if (hasChildren && category.children) {
          flattenCategories(category.children, level + 1, result);
        }
      });

      return result;
    };

    return flattenCategories(categoryTree);
  }

  getCategoryPath(categories: Category[], categoryId: string): Category[] {
    const path: Category[] = [];
    let currentCategory = categories.find((cat) => cat._id === categoryId);

    while (currentCategory) {
      path.unshift(currentCategory);
      currentCategory = categories.find(
        (cat) => cat._id === currentCategory?.parentId
      );
    }

    return path;
  }
}

export const categoryService = new CategoryService();
