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

  async hideCategory(id: string): Promise<void> {
    return this.put<void>(`${this.endpoint}/${id}/hide`, {});
  }

  async restoreCategory(id: string): Promise<Category> {
    return this.put<Category>(`${this.endpoint}/${id}/restore`, {});
  }

  buildFullCategoryTree(
    categories: Category[],
    parentId?: string
  ): CategoryWithChildren[] {
    return categories
      .filter((category) => {
        let parentMatch = false;

        if (parentId) {
          parentMatch = category.parentId === parentId;
        } else {
          parentMatch = !category.parentId || category.parentId === "";
        }


        const activeMatch = category.isActive !== false;

        return parentMatch && activeMatch;
      })
      .map((category) => ({
        ...category,
        children: this.buildFullCategoryTree(categories, category._id),
      }));
  }

  getAllCategoriesFlat(categories: Category[]): {
    id: string;
    name: string;
    level: number;
    isParent: boolean;
  }[] {
    const categoryTree = this.buildFullCategoryTree(categories);

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

        result.push({
          id: category._id,
          name: category.name,
          level,
          isParent: hasChildren,
        });

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
