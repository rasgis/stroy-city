import axios from "axios";
import { Product, ProductFormData } from "../types/product";
import { API_CONFIG } from "../config/api";
import { authService } from "./authService";
import { fileService } from "./fileService";
import { prepareDataForApi } from "../utils/apiUtils";

class ProductService {
  private getHeaders() {
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getProducts(): Promise<Product[]> {
    const response = await axios.get(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.BASE}`,
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async getProductById(id: string): Promise<Product> {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.BY_ID(
      id
    )}`;

    try {
      const response = await axios.get(url, { headers: this.getHeaders() });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createProduct(product: ProductFormData): Promise<Product> {
    try {
      // Подготавливаем данные с использованием общей утилиты
      const data = prepareDataForApi({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        unitOfMeasure: product.unitOfMeasure,
        stock: product.stock,
        isActive: product.isActive,
        image: product.image
      });

      console.log("Данные товара для отправки:", data);

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.BASE}`;

      const response = await axios.post(url, data, {
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Статус ошибки:", error.response.status);
        console.error("Данные ошибки:", error.response.data);
      }
      throw error;
    }
  }

  async updateProduct(id: string, product: ProductFormData): Promise<Product> {
    try {
      // Подготавливаем данные с использованием общей утилиты
      const data = prepareDataForApi({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        unitOfMeasure: product.unitOfMeasure,
        stock: product.stock,
        isActive: product.isActive,
        image: product.image
      });

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.BY_ID(
        id
      )}`;

      const response = await axios.put(url, data, {
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error("Ошибка при обновлении продукта:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    await axios.delete(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.BY_ID(id)}`,
      { headers: this.getHeaders() }
    );
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
