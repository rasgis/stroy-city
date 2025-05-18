import { Product, ProductFormData } from "../types/product";
import { API_CONFIG } from "../config/api";
import { BaseService } from "./common/BaseService";

class ProductService extends BaseService {
  private readonly endpoint = API_CONFIG.ENDPOINTS.PRODUCTS.BASE;

  async getProducts(): Promise<Product[]> {
    return this.get<Product[]>(this.endpoint);
  }

  async getAllProductsAdmin(): Promise<Product[]> {
    return this.get<Product[]>(`${this.endpoint}/admin/all`);
  }

  async getProductById(id: string): Promise<Product> {
    return this.get<Product>(API_CONFIG.ENDPOINTS.PRODUCTS.BY_ID(id));
  }

  async createProduct(product: ProductFormData): Promise<Product> {
    const data = {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      unitOfMeasure: product.unitOfMeasure,
      stock: product.stock,
      isActive: product.isActive,
      image: product.image,
    };

    return this.post<Product>(this.endpoint, data);
  }

  async updateProduct(id: string, product: ProductFormData): Promise<Product> {
    const data = {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      unitOfMeasure: product.unitOfMeasure,
      stock: product.stock,
      isActive: product.isActive,
      image: product.image,
    };

    return this.put<Product>(API_CONFIG.ENDPOINTS.PRODUCTS.BY_ID(id), data);
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      const response = await this.delete<void>(API_CONFIG.ENDPOINTS.PRODUCTS.BY_ID(id));
      return response;
    } catch (error) {
      throw error;
    }
  }

  async permanentDeleteProduct(id: string): Promise<void> {
    return this.delete<void>(`${this.endpoint}/permanent/${id}`);
  }

  async restoreProduct(id: string): Promise<Product> {
    try {
      const response = await this.put<any>(`${this.endpoint}/restore/${id}`, {});
      
      // Если сервер вернул только сообщение об успехе, а не сам товар
      if (response && (!response._id || !response.name)) {
        return this.getProductById(id);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  private convertFormDataToProduct(
    formData: ProductFormData
  ): Omit<Product, "_id" | "id" | "createdAt" | "updatedAt"> {
    return {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      category: formData.category,
      image: typeof formData.image === "string" ? formData.image : undefined,
      stock: formData.stock,
      unitOfMeasure: formData.unitOfMeasure,
    };
  }
}

export const productService = new ProductService();
